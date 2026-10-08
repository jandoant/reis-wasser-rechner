import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  clampGrams, displayWaterMl, formatNumber, formatRatio, kcal, roundTo, stepGrams, waterMl,
} from '../public/assets/js/lib/calc.js';
import { CATEGORIES, RICE, getRice } from '../public/assets/js/data/rice.js';
import { parseRoute } from '../public/assets/js/router.js';

test('waterMl — weight basis applies the ratio directly', () => {
  assert.equal(waterMl(200, 1.25, { basis: 'weight' }), 250);
  assert.equal(waterMl(200, 2, { basis: 'weight' }), 400);
});

test('waterMl — volume basis converts grams via density first', () => {
  assert.equal(waterMl(200, 1.25, { basis: 'volume', density: 0.8 }), 312.5);
  assert.equal(waterMl(400, 2, { basis: 'volume', density: 0.8 }), 1000);
});

test('waterMl / kcal — zero, negative and invalid input yield 0', () => {
  for (const g of [0, -50, NaN, Infinity]) {
    assert.equal(waterMl(g, 2), 0);
    assert.equal(kcal(g, 350), 0);
  }
});

test('displayWaterMl rounds to 5 ml', () => {
  assert.equal(displayWaterMl(200, 1.25, { basis: 'volume', density: 0.8 }), 315);
  assert.equal(roundTo(312.4, 5), 310);
});

test('kcal scales per 100 g', () => {
  assert.equal(kcal(200, 350), 700);
});

test('clampGrams parses, rounds and clamps', () => {
  assert.equal(clampGrams('250'), 250);
  assert.equal(clampGrams(' 99.6 '), 99);
  assert.equal(clampGrams(''), 0);
  assert.equal(clampGrams('abc'), 0);
  assert.equal(clampGrams(-10), 0);
  assert.equal(clampGrams(99999), 2000);
});

test('stepGrams snaps to the 25 g grid', () => {
  assert.equal(stepGrams(200, +1), 225);
  assert.equal(stepGrams(210, +1), 225);
  assert.equal(stepGrams(210, -1), 200);
  assert.equal(stepGrams(0, -1), 0);
  assert.equal(stepGrams(2000, +1), 2000);
});

test('formatting uses German conventions', () => {
  assert.equal(formatNumber(1234.4), '1.234');
  assert.equal(formatRatio(1.25), '1,25');
  assert.equal(formatRatio(2), '2');
});

test('rice data is complete and consistent', () => {
  assert.equal(RICE.length, 21);
  const ids = new Set(RICE.map((r) => r.id));
  assert.equal(ids.size, RICE.length, 'ids are unique');
  const categories = new Set(CATEGORIES.map((c) => c.id));
  for (const r of RICE) {
    assert.match(r.id, /^[a-z0-9-]+$/);
    assert.ok(categories.has(r.category), `${r.id} has a known category`);
    assert.ok(r.ratio > 0);
    assert.ok(r.kcalPer100g >= 300 && r.kcalPer100g <= 400, `${r.id}: plausible kcal for uncooked grain`);
    assert.ok(r.kcalSources.length > 0, `${r.id} has a calorie source`);
    for (const s of r.kcalSources) assert.match(s.url, /^https:\/\//, `${r.id}: source URL`);
  }
  assert.equal(getRice('kleb-reis').soak, true);
});

test('router parses hashes', () => {
  assert.deepEqual(parseRoute(''), { name: 'home' });
  assert.deepEqual(parseRoute('#/'), { name: 'home' });
  assert.deepEqual(parseRoute('#/reis/basmati-reis'), { name: 'rice', id: 'basmati-reis' });
  assert.deepEqual(parseRoute('#/foo'), { name: 'unknown' });
});

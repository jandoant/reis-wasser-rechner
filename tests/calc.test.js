import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  clampGrams, clampInt, displayWaterMl, formatDecimal, formatNumber, formatRatio, kcal, parseInteger,
  riceCups, roundTo, stepGrams, waterCups, waterMl,
} from '../public/assets/js/lib/calc.js';
import { CATEGORIES, RICE, getRice } from '../public/assets/js/data/rice.js';
import { parseRoute } from '../public/assets/js/router.js';

test('cups — grams are converted with the grams-per-cup value', () => {
  assert.equal(riceCups(300, 150), 2);
  assert.equal(waterCups(300, 1.25, 150), 2.5); // matches the official table: 2 cups rice → 2,5 cups water
  assert.equal(riceCups(300, 0), 0);
});

test('waterMl — cups of water × ml per cup', () => {
  assert.equal(waterMl(300, 1.25, { gramsPerCup: 150, cupMl: 180 }), 450);
  assert.equal(waterMl(200, 2, { gramsPerCup: 160, cupMl: 200 }), 500);
});

test('waterMl — defaults are 150 g and 180 ml per cup', () => {
  assert.equal(waterMl(200, 1.25), 300);
});

test('waterMl / kcal — zero, negative and invalid input yield 0', () => {
  for (const g of [0, -50, NaN, Infinity]) {
    assert.equal(waterMl(g, 2), 0);
    assert.equal(kcal(g, 350), 0);
  }
  assert.equal(waterMl(200, 2, { gramsPerCup: 150, cupMl: 0 }), 0);
});

test('displayWaterMl rounds to 5 ml', () => {
  assert.equal(displayWaterMl(210, 1.25, { gramsPerCup: 150, cupMl: 180 }), 315);
  assert.equal(roundTo(312.4, 5), 310);
});

test('parseInteger / clampInt', () => {
  assert.equal(parseInteger(' 42 '), 42);
  assert.equal(parseInteger(''), null);
  assert.equal(parseInteger('x'), null);
  assert.equal(clampInt('5', 20, 500, 150), 20);
  assert.equal(clampInt('', 20, 500, 150), 150);
  assert.equal(clampInt('9999', 20, 500, 150), 500);
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
  assert.equal(formatDecimal(1.333), '1,3');
  assert.equal(formatDecimal(2), '2');
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
  assert.deepEqual(parseRoute('#/einstellungen'), { name: 'settings' });
  assert.deepEqual(parseRoute('#/foo'), { name: 'unknown' });
});

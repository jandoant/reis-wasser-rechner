/**
 * Pure calculation and formatting helpers. No DOM access — unit-tested in /tests.
 */
import { CUP_ML, GRAMS, GRAMS_PER_CUP, WATER_ROUNDING_ML } from '../config.js';

const positive = (n) => Number.isFinite(n) && n > 0;

/**
 * Cups of rice for a given weight.
 * @param {number} grams        Uncooked rice in grams
 * @param {number} gramsPerCup  Grams of this rice in one level cup
 */
export function riceCups(grams, gramsPerCup) {
  return positive(grams) && positive(gramsPerCup) ? grams / gramsPerCup : 0;
}

/**
 * Cups of water: the sheet's ratio applied to the cups of rice.
 * @param {number} grams
 * @param {number} ratio  Cups of water per cup of rice
 * @param {number} gramsPerCup
 */
export function waterCups(grams, ratio, gramsPerCup) {
  return riceCups(grams, gramsPerCup) * ratio;
}

/**
 * Water in ml: cups of water × cup volume.
 * @param {number} grams
 * @param {number} ratio
 * @param {{gramsPerCup?: number, cupMl?: number}} [cup]
 * @returns {number} unrounded ml
 */
export function waterMl(grams, ratio, { gramsPerCup = GRAMS_PER_CUP.default, cupMl = CUP_ML.default } = {}) {
  return positive(cupMl) ? waterCups(grams, ratio, gramsPerCup) * cupMl : 0;
}

/** Water rounded for display. */
export const displayWaterMl = (grams, ratio, cup) => roundTo(waterMl(grams, ratio, cup), WATER_ROUNDING_ML);

/**
 * Energy for a given amount of uncooked rice.
 * @param {number} grams
 * @param {number} kcalPer100g
 */
export function kcal(grams, kcalPer100g) {
  return positive(grams) ? (grams * kcalPer100g) / 100 : 0;
}

/** Round to the nearest multiple of `step`. */
export function roundTo(value, step) {
  return step > 0 ? Math.round(value / step) * step : value;
}

/**
 * Parse user input to an integer; null if empty or not a number.
 * @param {unknown} value
 */
export function parseInteger(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : null;
  const n = parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(n) ? n : null;
}

/** Clamp an integer into [min, max]; invalid input yields `fallback`. */
export function clampInt(value, min, max, fallback = min) {
  const n = parseInteger(value);
  return n == null ? fallback : Math.min(max, Math.max(min, n));
}

/** Parse and clamp the rice amount. Empty / invalid input yields `min`. */
export function clampGrams(value, { min = GRAMS.min, max = GRAMS.max } = {}) {
  return clampInt(value, min, max);
}

/** Step grams up/down, snapping to the step grid (e.g. 210 + 25 → 225). */
export function stepGrams(current, direction, { step = GRAMS.step, min = GRAMS.min, max = GRAMS.max } = {}) {
  const snapped = direction > 0
    ? Math.floor(current / step) * step + step
    : Math.ceil(current / step) * step - step;
  return Math.min(max, Math.max(min, snapped));
}

const integerFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

/** 1234.4 → "1.234" */
export const formatNumber = (n) => integerFormat.format(Math.round(n));

/** 1.333 → "1,3"; 2 → "2" */
export const formatDecimal = (n) => decimalFormat.format(n);

/** 1.25 → "1,25" */
export const formatRatio = (r) => String(r).replace('.', ',');

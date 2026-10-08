/**
 * Pure calculation and formatting helpers. No DOM access — unit-tested in /tests.
 */
import { RATIO_BASIS, RICE_DENSITY_G_PER_ML, WATER_ROUNDING_ML, GRAMS } from '../config.js';

/**
 * Water needed for a given amount of uncooked rice.
 * @param {number} grams  Uncooked rice in grams
 * @param {number} ratio  Water parts per 1 part rice
 * @param {{basis?: 'volume'|'weight', density?: number}} [opts]
 * @returns {number} Water in ml (unrounded)
 */
export function waterMl(grams, ratio, { basis = RATIO_BASIS, density = RICE_DENSITY_G_PER_ML } = {}) {
  if (!Number.isFinite(grams) || grams <= 0) return 0;
  const riceAmount = basis === 'volume' ? grams / density : grams;
  return riceAmount * ratio;
}

/**
 * Energy for a given amount of uncooked rice.
 * @param {number} grams
 * @param {number} kcalPer100g
 */
export function kcal(grams, kcalPer100g) {
  if (!Number.isFinite(grams) || grams <= 0) return 0;
  return (grams * kcalPer100g) / 100;
}

/** Round to the nearest multiple of `step`. */
export function roundTo(value, step) {
  return step > 0 ? Math.round(value / step) * step : value;
}

/** Water rounded for display. */
export const displayWaterMl = (grams, ratio, opts) => roundTo(waterMl(grams, ratio, opts), WATER_ROUNDING_ML);

/**
 * Parse and clamp user input to a valid grams value.
 * Empty / invalid input yields `min`.
 * @param {unknown} value
 */
export function clampGrams(value, { min = GRAMS.min, max = GRAMS.max } = {}) {
  const n = typeof value === 'number' ? value : parseInt(String(value).trim(), 10);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Step grams up/down, snapping to the step grid (e.g. 210 + 25 → 225). */
export function stepGrams(current, direction, { step = GRAMS.step, min = GRAMS.min, max = GRAMS.max } = {}) {
  const snapped = direction > 0
    ? Math.floor(current / step) * step + step
    : Math.ceil(current / step) * step - step;
  return Math.min(max, Math.max(min, snapped));
}

const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

/** 1234.4 → "1.234" */
export const formatNumber = (n) => numberFormat.format(Math.round(n));

/** 1.25 → "1,25" */
export const formatRatio = (r) => String(r).replace('.', ',');

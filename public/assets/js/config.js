/**
 * Central configuration. Everything that is a tunable assumption lives here.
 */

/**
 * How the "Reis : Wasser" ratio on the rice sheet is meant.
 *  - 'volume': ratio refers to volume (e.g. measuring cup). Grams entered by
 *    the user are converted to millilitres of dry rice first.
 *  - 'weight': ratio is applied directly as grams rice → ml water.
 */
export const RATIO_BASIS = 'volume';

/** Bulk density of dry rice/quinoa in g/ml (used only when RATIO_BASIS = 'volume'). */
export const RICE_DENSITY_G_PER_ML = 0.8;

/** Water amounts are rounded to this step (ml) for display. */
export const WATER_ROUNDING_ML = 5;

/** Rice amount input (grams, uncooked). */
export const GRAMS = Object.freeze({
  min: 0,
  max: 2000,
  step: 25,
  default: 200,
  presets: Object.freeze([100, 200, 300, 500]),
});

/** Favourites a first-time visitor starts with. */
export const DEFAULT_FAVORITES = Object.freeze(['basmati-reis']);

/** localStorage key; bump the version suffix if the stored shape changes. */
export const STORAGE_KEY = 'reis-wasser-rechner:v1';

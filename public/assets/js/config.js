/**
 * Central configuration. Everything that is a tunable default lives here.
 *
 * The rice sheet's ratios are per measuring cup: rice and water are both
 * measured with the same cup (e.g. 1 cup rice : 1,25 cups water). To turn a
 * weight of rice into ml of water the app needs two values, both user-editable
 * in the settings and stored in the browser:
 *   - how many ml one cup holds        (one value, the cup)
 *   - how many grams of rice fill it   (one value per variety)
 */

/** Measuring cup volume in ml (water). */
export const CUP_ML = Object.freeze({
  default: 180,
  min: 50,
  max: 1000,
});

/** Grams of dry rice per level cup. Used until the user weighs their own. */
export const GRAMS_PER_CUP = Object.freeze({
  default: 150,
  min: 20,
  max: 1000,
});

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

/** localStorage key; bump the version suffix if the stored shape changes incompatibly. */
export const STORAGE_KEY = 'reis-wasser-rechner:v1';

/**
 * Application state, persisted to localStorage; views subscribe to changes.
 *
 *   favorites    ids of favourite varieties
 *   grams        last used rice amount
 *   cupMl        measuring cup volume (user setting)
 *   gramsPerCup  { [riceId]: grams } — only varieties the user has weighed
 */
import { CUP_ML, DEFAULT_FAVORITES, GRAMS, GRAMS_PER_CUP, STORAGE_KEY } from './config.js';
import { getRice } from './data/rice.js';
import { clampGrams, clampInt } from './lib/calc.js';
import { load, save } from './lib/storage.js';

/**
 * @typedef {Object} State
 * @property {string[]} favorites
 * @property {number} grams
 * @property {number} cupMl
 * @property {Record<string, number>} gramsPerCup
 */

const inRange = (n, { min, max }) => typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max;

/** Validate whatever was stored; fall back to defaults field by field. */
function hydrate(stored) {
  const favorites = Array.isArray(stored?.favorites)
    ? [...new Set(stored.favorites.filter((id) => typeof id === 'string' && getRice(id)))]
    : [...DEFAULT_FAVORITES];
  const grams = typeof stored?.grams === 'number' ? clampGrams(stored.grams) : GRAMS.default;
  const cupMl = inRange(stored?.cupMl, CUP_ML) ? stored.cupMl : CUP_ML.default;
  const gramsPerCup = {};
  if (stored?.gramsPerCup && typeof stored.gramsPerCup === 'object') {
    for (const [id, g] of Object.entries(stored.gramsPerCup)) {
      if (getRice(id) && inRange(g, GRAMS_PER_CUP)) gramsPerCup[id] = g;
    }
  }
  return { favorites, grams, cupMl, gramsPerCup };
}

/** @type {State} */
let state = hydrate(load(STORAGE_KEY));
const listeners = new Set();

/** @returns {Readonly<State>} */
export const getState = () => state;

/**
 * @param {(state: State, prev: State) => void} fn
 * @returns {() => void} unsubscribe
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** @param {Partial<State>} patch */
function update(patch) {
  const prev = state;
  state = { ...state, ...patch };
  save(STORAGE_KEY, state);
  listeners.forEach((fn) => fn(state, prev));
}

/* ---------- Favourites ---------- */

export const isFavorite = (id) => state.favorites.includes(id);

export function toggleFavorite(id) {
  update({
    favorites: isFavorite(id) ? state.favorites.filter((f) => f !== id) : [...state.favorites, id],
  });
}

/* ---------- Rice amount ---------- */

export function setGrams(value) {
  const grams = clampGrams(value);
  if (grams !== state.grams) update({ grams });
}

/* ---------- Measuring cup ---------- */

export function setCupMl(value) {
  const cupMl = clampInt(value, CUP_ML.min, CUP_ML.max, CUP_ML.default);
  if (cupMl !== state.cupMl) update({ cupMl });
}

/** Grams per cup for a variety: the user's value, or the default. */
export const getGramsPerCup = (id) => state.gramsPerCup[id] ?? GRAMS_PER_CUP.default;

/** True if the user has entered their own value for this variety. */
export const hasCustomGramsPerCup = (id) => id in state.gramsPerCup;

export function setGramsPerCup(id, value) {
  const g = clampInt(value, GRAMS_PER_CUP.min, GRAMS_PER_CUP.max, GRAMS_PER_CUP.default);
  if (state.gramsPerCup[id] !== g) update({ gramsPerCup: { ...state.gramsPerCup, [id]: g } });
}

export function resetGramsPerCup(id) {
  if (!hasCustomGramsPerCup(id)) return;
  const { [id]: _removed, ...rest } = state.gramsPerCup;
  update({ gramsPerCup: rest });
}

export function resetAllCupSettings() {
  update({ cupMl: CUP_ML.default, gramsPerCup: {} });
}

/** Everything the calculation needs for one variety. */
export const cupFor = (id) => ({ gramsPerCup: getGramsPerCup(id), cupMl: state.cupMl });

/**
 * Application state: favourites and the last used rice amount.
 * Persisted to localStorage; views subscribe to changes.
 */
import { DEFAULT_FAVORITES, GRAMS, STORAGE_KEY } from './config.js';
import { getRice } from './data/rice.js';
import { clampGrams } from './lib/calc.js';
import { load, save } from './lib/storage.js';

/** @typedef {{favorites: string[], grams: number}} State */

/** Validate whatever was stored; fall back to defaults field by field. */
function hydrate(stored) {
  const favorites = Array.isArray(stored?.favorites)
    ? [...new Set(stored.favorites.filter((id) => typeof id === 'string' && getRice(id)))]
    : [...DEFAULT_FAVORITES];
  const grams = typeof stored?.grams === 'number' ? clampGrams(stored.grams) : GRAMS.default;
  return { favorites, grams };
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

export const isFavorite = (id) => state.favorites.includes(id);

export function toggleFavorite(id) {
  update({
    favorites: isFavorite(id) ? state.favorites.filter((f) => f !== id) : [...state.favorites, id],
  });
}

export function setGrams(value) {
  const grams = clampGrams(value);
  if (grams !== state.grams) update({ grams });
}

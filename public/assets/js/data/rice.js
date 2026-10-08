/**
 * Rice varieties, taken from the "Reis-Wasser" sheet for the Digitaler Reiskocher.
 * ratio, mode and time are copied from the sheet.
 * Calorie values and their sources live in sources.js.
 */
import { KCAL } from './sources.js';

/** @typedef {'weiss'|'voll'|'kleb'|'quinoa'|'mix'} CategoryId */
/** @typedef {import('./sources.js').SourceLink} SourceLink */

/**
 * @typedef {Object} Rice
 * @property {string} id           URL-safe identifier
 * @property {string} name         Display name
 * @property {CategoryId} category
 * @property {number} ratio        Water per 1 part rice
 * @property {string} mode         Cooker programme
 * @property {string} time         Cooking time (for 2 portions)
 * @property {boolean} soak        Needs 4–12 h soaking
 * @property {number} kcalPer100g  Uncooked
 * @property {SourceLink[]} kcalSources
 * @property {string} [kcalNote]   Set when the value is not from the exact product
 */

/** @type {ReadonlyArray<{id: CategoryId, name: string}>} */
export const CATEGORIES = Object.freeze([
  { id: 'weiss', name: 'Weißer Reis' },
  { id: 'voll', name: 'Vollkorn & Naturreis' },
  { id: 'kleb', name: 'Klebreis' },
  { id: 'quinoa', name: 'Quinoa' },
  { id: 'mix', name: 'Mischungen' },
]);

const rows = [
  // id                         name                          category  ratio  mode      time         soak
  ['basmati-reis',              'Basmati Reis',               'weiss',  1.25, 'White',  '40 Min'],
  ['sushi-reis',                'Sushi Reis',                 'weiss',  1.25, 'Sushi',  '40 Min'],
  ['sadri-reis',                'Sadri Reis',                 'weiss',  1.25, 'White',  '40 Min'],
  ['jasmin-reis',               'Jasmin Reis',                'weiss',  1.25, 'White',  '40 Min'],
  ['sadri-dudi-reis',           'Sadri Dudi Reis',            'weiss',  1.25, 'White',  '40 Min'],
  ['vollkorn-basmati-reis',     'Vollkorn Basmati Reis',      'voll',   2,    'Brown',  '62 Min'],
  ['vollkorn-jasmin-reis',      'Vollkorn Jasmin Reis',       'voll',   2,    'Brown',  '62 Min'],
  ['roter-jasmin-reis',         'Roter Jasmin Reis',          'voll',   2,    'Brown',  '62 Min'],
  ['natur-reis',                'Natur Reis',                 'voll',   2,    'Brown',  '62 Min'],
  ['roter-reis',                'Roter Reis',                 'voll',   2,    'Brown',  '62 Min'],
  ['schwarzer-reis',            'Schwarzer Reis',             'voll',   2,    'Brown',  '62 Min'],
  ['lila-reis',                 'Lila Reis',                  'voll',   2,    'Brown',  '62 Min'],
  ['wild-reis',                 'Wild Reis',                  'voll',   2,    'Brown',  '62 Min'],
  ['kleb-reis',                 'Kleb Reis',                  'kleb',   1.25, 'Sushi',  '40 Min',    true],
  ['schwarzer-kleb-reis',       'Schwarzer Kleb Reis',        'kleb',   1.25, 'Sushi',  '40 Min',    true],
  ['mochi-reis',                'Mochi Reis',                 'kleb',   2,    'Brown',  '62 Min'],
  ['weisse-quinoa',             'Weiße Quinoa',               'quinoa', 2,    'Quinoa', '30–35 Min'],
  ['rote-quinoa',               'Rote Quinoa',                'quinoa', 2,    'Quinoa', '30–35 Min'],
  ['schwarze-quinoa',           'Schwarze Quinoa',            'quinoa', 2,    'Quinoa', '30–35 Min'],
  ['wild-reis-basmati-mix',     'Wild Reis Basmati Mix',      'mix',    1.25, 'Rice',   '40 Min'],
  ['basmati-linsen-quinoa-mix', 'Basmati Linsen Quinoa Mix',  'mix',    1.25, 'Rice',   '40 Min'],
];

/** @type {ReadonlyArray<Rice>} */
export const RICE = Object.freeze(
  rows.map(([id, name, category, ratio, mode, time, soak = false]) => {
    const energy = KCAL[id];
    if (!energy) throw new Error(`Missing calorie source for "${id}" in sources.js`);
    return Object.freeze({
      id, name, category, ratio, mode, time, soak,
      kcalPer100g: energy.kcal,
      kcalSources: energy.sources,
      kcalNote: energy.note,
    });
  }),
);

const byId = new Map(RICE.map((r) => [r.id, r]));
const categoryById = new Map(CATEGORIES.map((c) => [c.id, c]));

/** @param {string} id */
export const getRice = (id) => byId.get(id);

/** @param {CategoryId} id */
export const getCategory = (id) => categoryById.get(id);

/** @param {CategoryId} categoryId */
export const riceInCategory = (categoryId) => RICE.filter((r) => r.category === categoryId);

/** Varieties the cooker is not suitable for (shown as a note). */
export const NOT_RECOMMENDED = Object.freeze(['Risotto-Reis', 'Milchreis', 'Paella-Reis']);

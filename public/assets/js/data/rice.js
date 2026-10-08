/**
 * Rice varieties, taken from the "Reis-Wasser" sheet for the Digitaler Reiskocher.
 * ratio, mode and time are copied from the sheet.
 * kcalPer100g are approximate values for the uncooked product (not on the sheet).
 */

/** @typedef {'weiss'|'voll'|'kleb'|'quinoa'|'mix'} CategoryId */

/**
 * @typedef {Object} Rice
 * @property {string} id           URL-safe identifier
 * @property {string} name         Display name
 * @property {CategoryId} category
 * @property {number} ratio        Water per 1 part rice
 * @property {string} mode         Cooker programme
 * @property {string} time         Cooking time (for 2 portions)
 * @property {number} kcalPer100g  Approximate, uncooked
 * @property {boolean} soak        Needs 4–12 h soaking
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
  // id                       name                         category  ratio  mode      time         kcal  soak
  ['basmati-reis',            'Basmati Reis',              'weiss',  1.25, 'White',  '40 Min',    350],
  ['sushi-reis',              'Sushi Reis',                'weiss',  1.25, 'Sushi',  '40 Min',    355],
  ['sadri-reis',              'Sadri Reis',                'weiss',  1.25, 'White',  '40 Min',    350],
  ['jasmin-reis',             'Jasmin Reis',               'weiss',  1.25, 'White',  '40 Min',    355],
  ['sadri-dudi-reis',         'Sadri Dudi Reis',           'weiss',  1.25, 'White',  '40 Min',    350],
  ['vollkorn-basmati-reis',   'Vollkorn Basmati Reis',     'voll',   2,    'Brown',  '62 Min',    350],
  ['vollkorn-jasmin-reis',    'Vollkorn Jasmin Reis',      'voll',   2,    'Brown',  '62 Min',    350],
  ['roter-jasmin-reis',       'Roter Jasmin Reis',         'voll',   2,    'Brown',  '62 Min',    355],
  ['natur-reis',              'Natur Reis',                'voll',   2,    'Brown',  '62 Min',    350],
  ['roter-reis',              'Roter Reis',                'voll',   2,    'Brown',  '62 Min',    355],
  ['schwarzer-reis',          'Schwarzer Reis',            'voll',   2,    'Brown',  '62 Min',    355],
  ['lila-reis',               'Lila Reis',                 'voll',   2,    'Brown',  '62 Min',    355],
  ['wild-reis',               'Wild Reis',                 'voll',   2,    'Brown',  '62 Min',    357],
  ['kleb-reis',               'Kleb Reis',                 'kleb',   1.25, 'Sushi',  '40 Min',    360, true],
  ['schwarzer-kleb-reis',     'Schwarzer Kleb Reis',       'kleb',   1.25, 'Sushi',  '40 Min',    355, true],
  ['mochi-reis',              'Mochi Reis',                'kleb',   2,    'Brown',  '62 Min',    360],
  ['weisse-quinoa',           'Weiße Quinoa',              'quinoa', 2,    'Quinoa', '30–35 Min', 368],
  ['rote-quinoa',             'Rote Quinoa',               'quinoa', 2,    'Quinoa', '30–35 Min', 368],
  ['schwarze-quinoa',         'Schwarze Quinoa',           'quinoa', 2,    'Quinoa', '30–35 Min', 368],
  ['wild-reis-basmati-mix',   'Wild Reis Basmati Mix',     'mix',    1.25, 'Rice',   '40 Min',    352],
  ['basmati-linsen-quinoa-mix','Basmati Linsen Quinoa Mix','mix',    1.25, 'Rice',   '40 Min',    355],
];

/** @type {ReadonlyArray<Rice>} */
export const RICE = Object.freeze(
  rows.map(([id, name, category, ratio, mode, time, kcalPer100g, soak = false]) =>
    Object.freeze({ id, name, category, ratio, mode, time, kcalPer100g, soak }),
  ),
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

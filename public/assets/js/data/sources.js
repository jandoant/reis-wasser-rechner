/**
 * Nutrition sources for the calorie values in rice.js (kcal per 100 g, uncooked).
 *
 * Preference order:
 *   1. The manufacturer's own product page (Reishunger — the rice sheet is theirs).
 *   2. USDA FoodData Central (SR Legacy) when no product page exists.
 *   3. An estimate from the components' sourced values, clearly marked as such.
 *
 * Values checked on 2026-10-08.
 */

/** @typedef {{label: string, url: string}} SourceLink */

const reishunger = (path, label) => ({ label: `Reishunger: ${label}`, url: `https://www.reishunger.de/produkt/${path}` });
const usda = (fdcId, label) => ({ label: `USDA FoodData Central: ${label}`, url: `https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients` });

export const SOURCES = Object.freeze({
  bioBasmati: reishunger('386/bio-basmati-reis', 'Bio Basmati Reis'),
  sushi: reishunger('36/sushi-reis', 'Sushi Reis'),
  sadri: reishunger('208/sadri-reis', 'Sadri Reis'),
  jasmin: reishunger('30/jasmin-reis', 'Jasmin Reis'),
  vollkornBasmati: reishunger('387/vollkorn-bio-basmati-reis', 'Vollkorn Bio Basmati Reis'),
  vollkornJasmin: reishunger('1086/vollkorn-bio-jasmin-reis', 'Vollkorn Bio Jasmin Reis'),
  roterJasmin: reishunger('1348/roter-bio-jasmin-reis', 'Roter Bio Jasmin Reis'),
  natur: reishunger('496/bio-natur-reis', 'Bio Natur Reis'),
  roter: reishunger('107/roter-bio-reis', 'Roter Bio Reis'),
  schwarzer: reishunger('55/schwarzer-bio-reis', 'Schwarzer Bio Reis'),
  wild: reishunger('40/bio-wild-reis', 'Bio Wild Reis'),
  kleb: reishunger('81/kleb-reis', 'Kleb Reis'),
  wildBasmatiMix: reishunger('1098/bio-wild-reis-basmati-mix', 'Bio Wild Reis Basmati Mix'),

  usdaQuinoa: usda(168874, 'Quinoa, uncooked'),
  usdaGlutinous: usda(168883, 'Rice, white, glutinous, uncooked'),
  usdaBrownLong: usda(169703, 'Rice, brown, long-grain, raw'),
  usdaLentils: usda(172420, 'Lentils, raw'),
});

/**
 * Per-variety calorie value with its source(s).
 * `note` is shown when the value is not from the exact product.
 * @type {Record<string, {kcal: number, sources: SourceLink[], note?: string}>}
 */
export const KCAL = Object.freeze({
  'basmati-reis':              { kcal: 356, sources: [SOURCES.bioBasmati] },
  'sushi-reis':                { kcal: 349, sources: [SOURCES.sushi] },
  'sadri-reis':                { kcal: 367, sources: [SOURCES.sadri] },
  'jasmin-reis':               { kcal: 347, sources: [SOURCES.jasmin] },
  'sadri-dudi-reis':           { kcal: 367, sources: [SOURCES.sadri],
                                 note: 'Wert des ungeräucherten Sadri Reis' },
  'vollkorn-basmati-reis':     { kcal: 356, sources: [SOURCES.vollkornBasmati] },
  'vollkorn-jasmin-reis':      { kcal: 351, sources: [SOURCES.vollkornJasmin] },
  'roter-jasmin-reis':         { kcal: 351, sources: [SOURCES.roterJasmin] },
  'natur-reis':                { kcal: 384, sources: [SOURCES.natur] },
  'roter-reis':                { kcal: 350, sources: [SOURCES.roter] },
  'schwarzer-reis':            { kcal: 343, sources: [SOURCES.schwarzer] },
  'lila-reis':                 { kcal: 367, sources: [SOURCES.usdaBrownLong],
                                 note: 'Referenzwert für Vollkornreis' },
  'wild-reis':                 { kcal: 368, sources: [SOURCES.wild] },
  'kleb-reis':                 { kcal: 353, sources: [SOURCES.kleb] },
  'schwarzer-kleb-reis':       { kcal: 370, sources: [SOURCES.usdaGlutinous],
                                 note: 'Referenzwert für Klebreis' },
  'mochi-reis':                { kcal: 370, sources: [SOURCES.usdaGlutinous],
                                 note: 'Referenzwert für Klebreis' },
  'weisse-quinoa':             { kcal: 368, sources: [SOURCES.usdaQuinoa] },
  'rote-quinoa':               { kcal: 368, sources: [SOURCES.usdaQuinoa],
                                 note: 'Referenzwert für Quinoa' },
  'schwarze-quinoa':           { kcal: 368, sources: [SOURCES.usdaQuinoa],
                                 note: 'Referenzwert für Quinoa' },
  'wild-reis-basmati-mix':     { kcal: 359, sources: [SOURCES.wildBasmatiMix] },
  'basmati-linsen-quinoa-mix': { kcal: 359, sources: [SOURCES.bioBasmati, SOURCES.usdaLentils, SOURCES.usdaQuinoa],
                                 note: 'Schätzung aus dem Mittelwert der Bestandteile: 356, 352 und 368 kcal' },
});

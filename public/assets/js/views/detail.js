/**
 * Detail view: amount input and calculated water / calories for one variety.
 * The markup is rendered once; state changes only patch the dynamic parts,
 * so number inputs keep focus while typing.
 */
import { GRAMS, GRAMS_PER_CUP } from '../config.js';
import { getCategory } from '../data/rice.js';
import {
  displayWaterMl, formatDecimal, formatNumber, formatRatio, kcal, riceCups, stepGrams, waterCups,
} from '../lib/calc.js';
import { $, $$, html, render } from '../lib/dom.js';
import { bindNumberField } from '../lib/number-field.js';
import {
  cupFor, getGramsPerCup, getState, hasCustomGramsPerCup, resetGramsPerCup, setGrams, setGramsPerCup,
  subscribe, toggleFavorite,
} from '../store.js';
import { HOME_HREF, SETTINGS_HREF } from '../router.js';

/** "Quelle: <link>[, <link>] (note)" under the calorie value. */
function sourcesLine(rice) {
  const links = rice.kcalSources.map((s, i) => html`${i > 0 ? ', ' : ''}<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`);
  return html`
    <p class="kcal__source">
      ${rice.kcalSources.length > 1 ? 'Quellen' : 'Quelle'}: ${links}${rice.kcalNote ? html` <span class="kcal__note">(${rice.kcalNote})</span>` : ''}
    </p>`;
}

/** @param {import('../data/rice.js').Rice} rice */
function template(rice) {
  return html`
    <div class="page page--detail">
      <nav class="toolbar">
        <a class="link-back" href="${HOME_HREF}">← Sorten</a>
        <button type="button" class="pill" data-action="toggle-fav" aria-pressed="false"></button>
      </nav>

      <header class="title-block">
        <span class="eyebrow">${getCategory(rice.category).name}</span>
        <h1 class="display display--sm">${rice.name}</h1>
      </header>

      ${rice.soak ? html`<p class="hint" role="note">Vorher 4–12 Std. einweichen.</p>` : ''}

      <section class="amount" aria-labelledby="amount-label">
        <label id="amount-label" class="eyebrow" for="grams">Menge Reis (ungekocht)</label>
        <div class="stepper">
          <button type="button" class="round" data-action="dec" aria-label="${GRAMS.step} g weniger">−</button>
          <div class="stepper__value">
            <input id="grams" class="stepper__input" type="number" inputmode="numeric" step="1" autocomplete="off">
            <span class="stepper__unit">g</span>
          </div>
          <button type="button" class="round round--solid" data-action="inc" aria-label="${GRAMS.step} g mehr">+</button>
        </div>
        <div class="presets" role="group" aria-label="Schnellauswahl">
          ${GRAMS.presets.map((p) => html`
            <button type="button" class="preset" data-action="preset" data-grams="${p}" aria-pressed="false">${p} g</button>`)}
        </div>
      </section>

      <section class="result" aria-label="Ergebnis">
        <div class="result__water">
          <span class="eyebrow eyebrow--inverse">Wasser</span>
          <p class="result__value"><output data-out="water" aria-live="polite">0</output><span class="result__unit">ml</span></p>
          <p class="result__cups" data-out="cups"></p>
        </div>
        <dl class="result__facts">
          <div><dt>Verhältnis</dt><dd>1 : ${formatRatio(rice.ratio)}</dd></div>
          <div><dt>Modus</dt><dd class="accent">${rice.mode}</dd></div>
          <div><dt>Kochzeit*</dt><dd>≈ ${rice.time}</dd></div>
        </dl>
      </section>

      <section class="cup" aria-labelledby="cup-title">
        <div class="cup__row">
          <div class="cup__label">
            <h2 id="cup-title" class="cup__title"><label for="grams-per-cup">Reis pro Messbecher</label></h2>
            <span class="mono muted" data-out="cup-status"></span>
          </div>
          <div class="field">
            <input id="grams-per-cup" class="field__input" type="number" inputmode="numeric" step="1" autocomplete="off">
            <span class="field__unit">g</span>
          </div>
        </div>
        <p class="cup__help">
          Becher locker mit trockenem ${rice.name} füllen, glatt streichen und wiegen.
          <button type="button" class="link-button" data-action="reset-cup" hidden>Standard (${GRAMS_PER_CUP.default} g) wiederherstellen</button>
        </p>
        <p class="cup__help"><span data-out="cup-ml"></span> · <a href="${SETTINGS_HREF}">Becher-Einstellungen</a></p>
      </section>

      <section class="kcal" aria-labelledby="kcal-title">
        <div class="kcal__row">
          <div class="kcal__label">
            <h2 id="kcal-title" class="kcal__title">Kalorien gesamt</h2>
            <span class="mono muted">${rice.kcalPer100g} kcal / 100 g roh</span>
          </div>
          <p class="kcal__value"><output data-out="kcal">0</output> <span>kcal</span></p>
        </div>
        ${sourcesLine(rice)}
      </section>

      <p class="footnote">
        * Die Kochzeit bezieht sich auf 2 Portionen. Alle Zeitangaben sind Richtwerte.<br>
        Das Verhältnis gilt pro Messbecher: Reis und Wasser werden mit demselben Becher abgemessen.
      </p>
    </div>`;
}

/**
 * @param {HTMLElement} root
 * @param {import('../data/rice.js').Rice} rice
 * @returns {() => void} cleanup
 */
export function mountDetail(root, rice) {
  document.title = `${rice.name} · Reis & Wasser`;
  render(root, template(rice));

  const out = (name) => $(root, `[data-out="${name}"]`);
  const favButton = $(root, '[data-action="toggle-fav"]');
  const resetCupButton = $(root, '[data-action="reset-cup"]');
  const presets = $$(root, '[data-action="preset"]');

  const gramsField = bindNumberField($(root, '#grams'), {
    min: GRAMS.min, max: GRAMS.max, get: () => getState().grams, set: setGrams,
  });
  const cupField = bindNumberField($(root, '#grams-per-cup'), {
    min: GRAMS_PER_CUP.min, max: GRAMS_PER_CUP.max,
    get: () => getGramsPerCup(rice.id), set: (g) => setGramsPerCup(rice.id, g),
  });

  function update(state) {
    const { grams, favorites, cupMl } = state;
    const cup = cupFor(rice.id);
    const custom = hasCustomGramsPerCup(rice.id);

    out('water').textContent = formatNumber(displayWaterMl(grams, rice.ratio, cup));
    out('cups').textContent = grams > 0
      ? `≈ ${formatDecimal(riceCups(grams, cup.gramsPerCup))} Becher Reis → ${formatDecimal(waterCups(grams, rice.ratio, cup.gramsPerCup))} Becher Wasser`
      : '';
    out('kcal').textContent = formatNumber(kcal(grams, rice.kcalPer100g));
    out('cup-status').textContent = custom ? 'Eigener Wert' : 'Standardwert – einmal abwiegen für genaue Werte';
    out('cup-ml').textContent = `1 Becher = ${formatNumber(cupMl)} ml Wasser`;
    resetCupButton.hidden = !custom;

    gramsField.sync();
    cupField.sync();
    presets.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.grams) === grams)));
    const fav = favorites.includes(rice.id);
    favButton.textContent = fav ? '★ Favorit' : '☆ Merken';
    favButton.setAttribute('aria-pressed', String(fav));
  }

  const onClick = (event) => {
    const target = /** @type {HTMLElement} */ (event.target).closest('[data-action]');
    if (!target) return;
    const { grams } = getState();
    switch (target.dataset.action) {
      case 'inc': setGrams(stepGrams(grams, +1)); break;
      case 'dec': setGrams(stepGrams(grams, -1)); break;
      case 'preset': setGrams(Number(target.dataset.grams)); break;
      case 'toggle-fav': toggleFavorite(rice.id); break;
      case 'reset-cup': resetGramsPerCup(rice.id); break;
    }
  };

  root.addEventListener('click', onClick);
  const unsubscribe = subscribe(update);
  update(getState());

  return () => {
    unsubscribe();
    gramsField.destroy();
    cupField.destroy();
    root.removeEventListener('click', onClick);
  };
}

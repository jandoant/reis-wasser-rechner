/**
 * Detail view: amount input and calculated water / calories for one variety.
 * The markup is rendered once; state changes only patch the dynamic parts,
 * so the number input keeps focus while typing.
 */
import { GRAMS, RATIO_BASIS, RICE_DENSITY_G_PER_ML } from '../config.js';
import { getCategory } from '../data/rice.js';
import { displayWaterMl, formatNumber, formatRatio, kcal, stepGrams } from '../lib/calc.js';
import { $, $$, html, render } from '../lib/dom.js';
import { getState, setGrams, subscribe, toggleFavorite } from '../store.js';
import { HOME_HREF } from '../router.js';

function basisNote() {
  if (RATIO_BASIS !== 'volume') return 'Wasser = Reis (g) × Verhältnis.';
  const mlPerGram = formatNumber(1000 / RICE_DENSITY_G_PER_ML);
  return `Das Verhältnis gilt nach Volumen. Umrechnung: 1 kg Reis ≈ ${mlPerGram} ml.`;
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
            <input id="grams" class="stepper__input" type="number" inputmode="numeric"
              min="${GRAMS.min}" max="${GRAMS.max}" step="1" autocomplete="off">
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
        </div>
        <dl class="result__facts">
          <div><dt>Verhältnis</dt><dd>1 : ${formatRatio(rice.ratio)}</dd></div>
          <div><dt>Modus</dt><dd class="accent">${rice.mode}</dd></div>
          <div><dt>Kochzeit*</dt><dd>≈ ${rice.time}</dd></div>
        </dl>
      </section>

      <section class="kcal">
        <div>
          <h2 class="kcal__title">Kalorien gesamt</h2>
          <span class="mono muted">ca. ${rice.kcalPer100g} kcal / 100 g roh</span>
        </div>
        <p class="kcal__value"><output data-out="kcal">0</output> <span>kcal</span></p>
      </section>

      <p class="footnote">
        * Die Kochzeit bezieht sich auf 2 Portionen. Alle Zeitangaben sind Richtwerte.<br>
        ${basisNote()} Kalorienangaben sind Näherungswerte.
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

  const input = /** @type {HTMLInputElement} */ ($(root, '#grams'));
  const favButton = $(root, '[data-action="toggle-fav"]');
  const waterOut = $(root, '[data-out="water"]');
  const kcalOut = $(root, '[data-out="kcal"]');
  const presets = $$(root, '[data-action="preset"]');

  function update({ grams, favorites }) {
    waterOut.textContent = formatNumber(displayWaterMl(grams, rice.ratio));
    kcalOut.textContent = formatNumber(kcal(grams, rice.kcalPer100g));
    // Don't overwrite the field while the user is typing in it.
    if (document.activeElement !== input) input.value = String(grams);
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
    }
  };
  const onInput = () => setGrams(input.value);
  // On commit (blur/enter), show the normalised value (e.g. clamped to max).
  const onChange = () => { input.value = String(getState().grams); };
  const onKeydown = (e) => { if (e.key === 'Enter') input.blur(); };

  root.addEventListener('click', onClick);
  input.addEventListener('input', onInput);
  input.addEventListener('change', onChange);
  input.addEventListener('keydown', onKeydown);
  const unsubscribe = subscribe(update);
  update(getState());

  return () => {
    unsubscribe();
    root.removeEventListener('click', onClick);
  };
}


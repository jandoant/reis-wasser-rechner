/**
 * Settings view: measuring cup volume and grams of rice per cup for every
 * variety. All values are stored in the browser (localStorage).
 */
import { CUP_ML, GRAMS_PER_CUP } from '../config.js';
import { CATEGORIES, riceInCategory } from '../data/rice.js';
import { $, $$, html, render } from '../lib/dom.js';
import { bindNumberField } from '../lib/number-field.js';
import {
  getGramsPerCup, getState, hasCustomGramsPerCup, resetAllCupSettings, resetGramsPerCup,
  setCupMl, setGramsPerCup, subscribe,
} from '../store.js';
import { HOME_HREF } from '../router.js';

const riceRow = (rice) => html`
  <li class="setting-row" data-rice-row="${rice.id}">
    <div class="setting-row__label">
      <label for="gpc-${rice.id}" class="setting-row__name">${rice.name}</label>
      <span class="setting-row__status mono muted" data-status></span>
    </div>
    <div class="setting-row__controls">
      <button type="button" class="icon-button" data-action="reset" data-rice-id="${rice.id}"
        aria-label="${rice.name} auf Standard zurücksetzen" title="Auf Standard zurücksetzen" hidden>↺</button>
      <div class="field field--sm">
        <input id="gpc-${rice.id}" class="field__input" type="number" inputmode="numeric" step="1"
          autocomplete="off" data-rice-id="${rice.id}">
        <span class="field__unit">g</span>
      </div>
    </div>
  </li>`;

function template() {
  return html`
    <div class="page page--settings">
      <nav class="toolbar">
        <a class="link-back" href="${HOME_HREF}">← Sorten</a>
      </nav>

      <header class="title-block">
        <span class="eyebrow">Einstellungen</span>
        <h1 class="display display--sm">Messbecher</h1>
        <p class="lead">Die Verhältnisse gelten pro Becher. Mit diesen Werten rechnet die App Gramm in Milliliter um.
          Sie werden nur in diesem Browser gespeichert.</p>
      </header>

      <section class="settings-card" aria-labelledby="cup-ml-label">
        <div class="setting-row setting-row--main">
          <div class="setting-row__label">
            <label id="cup-ml-label" for="cup-ml" class="setting-row__name">Wasser pro Becher</label>
            <span class="mono muted">Standard: ${CUP_ML.default} ml</span>
          </div>
          <div class="field">
            <input id="cup-ml" class="field__input" type="number" inputmode="numeric" step="1" autocomplete="off">
            <span class="field__unit">ml</span>
          </div>
        </div>
        <p class="cup__help">Becher randvoll mit Wasser füllen und wiegen (ohne Becher): 1 g Wasser = 1 ml.</p>
      </section>

      <section class="settings-section" aria-labelledby="gpc-title">
        <header class="category__head">
          <h2 id="gpc-title" class="category__title">Reis pro Becher</h2>
          <span class="mono muted">Standard: ${GRAMS_PER_CUP.default} g</span>
        </header>
        <p class="cup__help">Becher locker mit trockenem Reis füllen, glatt streichen und wiegen (ohne Becher).
          Jede Sorte ist etwas unterschiedlich schwer.</p>
        ${CATEGORIES.map((cat) => html`
          <div class="settings-group">
            <h3 class="eyebrow">${cat.name}</h3>
            <ul class="setting-list" role="list">${riceInCategory(cat.id).map(riceRow)}</ul>
          </div>`)}
      </section>

      <button type="button" class="pill pill--wide" data-action="reset-all">Alle Becherwerte zurücksetzen</button>
    </div>`;
}

/** @param {HTMLElement} root @returns {() => void} cleanup */
export function mountSettings(root) {
  document.title = 'Einstellungen · Reis & Wasser';
  render(root, template());

  const cupMlField = bindNumberField($(root, '#cup-ml'), {
    min: CUP_ML.min, max: CUP_ML.max, get: () => getState().cupMl, set: setCupMl,
  });

  const rows = $$(root, '[data-rice-row]').map((row) => {
    const id = row.dataset.riceRow;
    return {
      id,
      status: $(row, '[data-status]'),
      reset: $(row, '[data-action="reset"]'),
      field: bindNumberField($(row, 'input'), {
        min: GRAMS_PER_CUP.min, max: GRAMS_PER_CUP.max,
        get: () => getGramsPerCup(id), set: (g) => setGramsPerCup(id, g),
      }),
    };
  });

  function update() {
    cupMlField.sync();
    for (const row of rows) {
      const custom = hasCustomGramsPerCup(row.id);
      row.field.sync();
      row.status.textContent = custom ? 'eigener Wert' : 'Standard';
      row.reset.hidden = !custom;
    }
  }

  const onClick = (event) => {
    const target = /** @type {HTMLElement} */ (event.target).closest('[data-action]');
    if (!target) return;
    if (target.dataset.action === 'reset') resetGramsPerCup(target.dataset.riceId);
    if (target.dataset.action === 'reset-all'
      && window.confirm('Becher-Volumen und alle Reis-pro-Becher-Werte auf Standard zurücksetzen?')) {
      resetAllCupSettings();
    }
  };

  root.addEventListener('click', onClick);
  const unsubscribe = subscribe(update);
  update();

  return () => {
    unsubscribe();
    cupMlField.destroy();
    rows.forEach((r) => r.field.destroy());
    root.removeEventListener('click', onClick);
  };
}


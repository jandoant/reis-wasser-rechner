/**
 * Home view: favourites + all varieties grouped by category.
 */
import { CATEGORIES, NOT_RECOMMENDED, RICE, riceInCategory } from '../data/rice.js';
import { formatRatio } from '../lib/calc.js';
import { html, render } from '../lib/dom.js';
import { getState, isFavorite, subscribe } from '../store.js';
import { riceHref, SETTINGS_HREF } from '../router.js';

const favoriteChip = (rice) => html`
  <li><a class="chip" href="${riceHref(rice.id)}">${rice.name}</a></li>`;

const riceCard = (rice) => html`
  <li>
    <a class="card" href="${riceHref(rice.id)}">
      <span class="card__name">${rice.name}</span>
      <span class="card__meta">
        <span>1 : ${formatRatio(rice.ratio)}</span>
        ${isFavorite(rice.id) ? html`<span class="card__fav" aria-label="Favorit">★</span>` : ''}
      </span>
    </a>
  </li>`;

function categorySection(category) {
  const items = riceInCategory(category.id);
  return html`
    <section class="category" aria-labelledby="cat-${category.id}">
      <header class="category__head">
        <h2 id="cat-${category.id}" class="category__title">${category.name}</h2>
        <span class="mono muted">${items.length} Sorten</span>
      </header>
      <ul class="grid" role="list">${items.map(riceCard)}</ul>
    </section>`;
}

function template() {
  const favorites = RICE.filter((r) => getState().favorites.includes(r.id));
  return html`
    <div class="page page--home">
      <header class="intro">
        <div class="intro__top">
          <span class="eyebrow">Digitaler Reiskocher</span>
          <a class="settings-link" href="${SETTINGS_HREF}">Messbecher ⚙</a>
        </div>
        <h1 class="display">Reis &amp; Wasser</h1>
        <p class="lead">Wähle deine Sorte, wir rechnen das Wasser aus.</p>
      </header>

      ${favorites.length > 0 ? html`
        <section class="favorites" aria-labelledby="fav-title">
          <h2 id="fav-title" class="eyebrow eyebrow--accent">★ Favoriten</h2>
          <ul class="chips" role="list">${favorites.map(favoriteChip)}</ul>
        </section>` : ''}

      ${CATEGORIES.map(categorySection)}

      <aside class="note">
        <h2 class="note__title">Nicht empfohlen</h2>
        <p>Die Zubereitung von ${NOT_RECOMMENDED.slice(0, -1).join(', ')} und ${NOT_RECOMMENDED.at(-1)}
          im Digitalen Reiskocher empfehlen wir nicht.</p>
      </aside>
    </div>`;
}

/** @param {HTMLElement} root @returns {() => void} cleanup */
export function mountHome(root) {
  document.title = 'Reis & Wasser';
  render(root, template());
  return subscribe((state, prev) => {
    if (state.favorites !== prev.favorites) render(root, template());
  });
}

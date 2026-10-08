# Reis & Wasser

Reis-Wasser-Rechner für den Digitalen Reiskocher: Sorte wählen, Menge Reis in Gramm eingeben, Wassermenge, Modus, Kochzeit und Kalorien ablesen.

Static web app: plain HTML, CSS and ES modules. There is no framework, no build step and no dependencies. It works offline after the first visit and can be installed to the home screen (PWA).

## Features

- 21 varieties in 5 categories, with ratio, mode and time taken from the rice sheet (`2401-reis-wasser-a4-de-drk.pdf`)
- Amount input via −/+ (25 g steps), presets or typing; values are clamped to 0–2000 g
- Favourites and the last used amount are saved in `localStorage`
- Deep links (`#/reis/basmati-reis`) and the browser back button work
- Offline support via a service worker
- Accessible: real links and buttons, labelled input, `aria-pressed` states, live region for the result

## Project structure

```
public/                     ← deploy this folder
├── index.html              HTML shell
├── manifest.webmanifest    PWA manifest
├── sw.js                   Service worker (offline cache)
├── _headers                Cloudflare Pages security/cache headers
└── assets/
    ├── css/styles.css      Design tokens + component styles
    ├── icons/              App icons (SVG + PNG)
    └── js/
        ├── main.js         Entry: router → views, SW registration
        ├── router.js       Hash routing (#/ and #/reis/<id>)
        ├── config.js       Tunable assumptions (ratio basis, density, presets, …)
        ├── store.js        App state + persistence + subscriptions
        ├── data/rice.js    Rice varieties and categories
        ├── lib/calc.js     Pure calculation & formatting (unit-tested)
        ├── lib/dom.js      Escaping `html` template helper
        ├── lib/storage.js  Fail-safe localStorage wrapper
        └── views/
            ├── home.js     Overview: favourites + categories
            └── detail.js   Calculator for one variety
tests/calc.test.js          Unit tests (node:test, no dependencies)
```

## How the water is calculated

The sheet gives ratios such as `1 : 1,25`. Rice-cooker ratios are normally meant **by volume**, so the app converts grams to volume first:

```
water (ml) = grams / density × ratio        density = 0.8 g/ml
```

For example, 200 g basmati → 250 ml rice volume → 312.5 ml water, displayed as 315 ml (rounded to 5 ml).

If your sheet means weight, set `RATIO_BASIS = 'weight'` in `public/assets/js/config.js`. The water is then simply `grams × ratio`. The calorie values (`kcalPer100g` in `data/rice.js`) are approximations, not taken from the sheet.

## Run locally

```bash
npm start      # serves ./public on http://localhost:8080
npm test       # runs the unit tests (Node ≥ 20)
```

Any static server works, for example `python3 -m http.server -d public 8080`. Opening `index.html` directly from the file system does not work, because browsers block ES modules on `file://`.

## Deploy to Cloudflare Pages

**Option A: Direct upload (no Git)**
1. Cloudflare dashboard → *Workers & Pages* → *Create* → *Pages* → *Upload assets*.
2. Name the project, then drag the **`public`** folder in. Done.

**Option B: Connect the GitHub repo**
1. *Create* → *Pages* → *Connect to Git* → select `reis-wasser-rechner`.
2. Framework preset: *None*. Build command: *(empty)*. Build output directory: **`public`**.
3. Every push to `main` then redeploys automatically.

**Option C: CLI**
```bash
npx wrangler pages deploy public --project-name reis-wasser-rechner
```

### Updating

When you change files in `public/`, bump `CACHE_VERSION` in `public/sw.js`. Returning visitors then get the new version right away instead of the cached one.

### Editing varieties

Add or change rows in `public/assets/js/data/rice.js`. Each `id` must be unique, lowercase and URL-safe, because it appears in the link. Run `npm test` afterwards. If the number of varieties changes, update the count check in `tests/calc.test.js`.

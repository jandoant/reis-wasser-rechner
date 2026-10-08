# Reis & Wasser

Reis-Wasser-Rechner für den Digitalen Reiskocher: Sorte wählen, Menge Reis in Gramm eingeben, Wassermenge, Modus, Kochzeit und Kalorien ablesen.

Static web app: plain HTML, CSS and ES modules. There is no framework, no build step and no dependencies. It works offline after the first visit and can be installed to the home screen (PWA).

## Features

- 21 varieties in 5 categories, with ratio, mode and time taken from the rice sheet (`2401-reis-wasser-a4-de-drk.pdf`)
- Amount input via −/+ (25 g steps), presets or typing; values are clamped to 0–2000 g
- Measuring cup settings: ml per cup, plus grams of rice per cup for each variety, saved in the browser
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
        ├── router.js       Hash routing (#/, #/reis/<id>, #/einstellungen)
        ├── config.js       Defaults (cup ml, grams per cup, presets, …)
        ├── store.js        App state + persistence + subscriptions
        ├── data/rice.js    Rice varieties and categories
        ├── lib/calc.js     Pure calculation & formatting (unit-tested)
        ├── lib/dom.js      Escaping `html` template helper
        ├── lib/storage.js  Fail-safe localStorage wrapper
        ├── lib/number-field.js  Number input ↔ store binding
        └── views/
            ├── home.js     Overview: favourites + categories
            ├── detail.js   Calculator for one variety
            └── settings.js Measuring cup settings
tests/calc.test.js          Unit tests (node:test, no dependencies)
```

## How the water is calculated

The official ratios are per measuring cup: rice and water are measured with the same cup (1 cup rice : 1,25 cups water for white rice). To get from grams to millilitres, the app uses two values:

```
cups of rice  = grams ÷ grams of rice per cup     (per variety)
water (ml)    = cups of rice × ratio × ml per cup (one value for the cup)
```

For example, with the defaults of 150 g and 180 ml, 200 g basmati is 1.33 cups of rice, which needs 1.67 cups of water, or 300 ml.

Both values can be set in the app and are stored in the browser's `localStorage`:
- **ml per cup:** on the settings page (`#/einstellungen`, linked from the home screen as "Messbecher ⚙").
- **grams per cup:** for each variety, either on the settings page or directly on that variety's detail page.

Until a value has been weighed, the app uses the defaults from `public/assets/js/config.js` (`CUP_ML`, `GRAMS_PER_CUP`) and labels them as default values.

**Measuring:** to get ml per cup, fill the cup to the brim with water and weigh it; 1 g of water is 1 ml. To get grams per cup, fill the cup loosely with dry rice, level it off and weigh it. Subtract the cup's own weight in both cases.

## Calorie sources

Calorie values (kcal per 100 g, uncooked) live in `public/assets/js/data/sources.js`, together with their sources. The app shows the source as a link under the calorie value. The sources were checked on 2026-10-08, in this order of preference:

1. **Reishunger product page**, the manufacturer of the rice sheet. Used for 13 varieties.
2. **USDA FoodData Central (SR Legacy)**, used where no product page exists.
3. **An estimate** from the components' sourced values. This is marked as such in the app.

| Variety | kcal | Source |
|---|---|---|
| Basmati Reis | 356 | [Reishunger Bio Basmati Reis](https://www.reishunger.de/produkt/386/bio-basmati-reis) |
| Sushi Reis | 349 | [Reishunger Sushi Reis](https://www.reishunger.de/produkt/36/sushi-reis) |
| Sadri Reis | 367 | [Reishunger Sadri Reis](https://www.reishunger.de/produkt/208/sadri-reis) |
| Jasmin Reis | 347 | [Reishunger Jasmin Reis](https://www.reishunger.de/produkt/30/jasmin-reis) |
| Sadri Dudi Reis | 367 | [Reishunger Sadri Reis](https://www.reishunger.de/produkt/208/sadri-reis) (unsmoked variety, no own page) |
| Vollkorn Basmati Reis | 356 | [Reishunger Vollkorn Bio Basmati Reis](https://www.reishunger.de/produkt/387/vollkorn-bio-basmati-reis) |
| Vollkorn Jasmin Reis | 351 | [Reishunger Vollkorn Bio Jasmin Reis](https://www.reishunger.de/produkt/1086/vollkorn-bio-jasmin-reis) |
| Roter Jasmin Reis | 351 | [Reishunger Roter Bio Jasmin Reis](https://www.reishunger.de/produkt/1348/roter-bio-jasmin-reis) |
| Natur Reis | 384 | [Reishunger Bio Natur Reis](https://www.reishunger.de/produkt/496/bio-natur-reis) |
| Roter Reis | 350 | [Reishunger Roter Bio Reis](https://www.reishunger.de/produkt/107/roter-bio-reis) |
| Schwarzer Reis | 343 | [Reishunger Schwarzer Bio Reis](https://www.reishunger.de/produkt/55/schwarzer-bio-reis) |
| Lila Reis | 367 | [USDA 169703 – Rice, brown, long-grain, raw](https://fdc.nal.usda.gov/food-details/169703/nutrients) (whole-grain reference) |
| Wild Reis | 368 | [Reishunger Bio Wild Reis](https://www.reishunger.de/produkt/40/bio-wild-reis) |
| Kleb Reis | 353 | [Reishunger Kleb Reis](https://www.reishunger.de/produkt/81/kleb-reis) |
| Schwarzer Kleb Reis | 370 | [USDA 168883 – Rice, white, glutinous, uncooked](https://fdc.nal.usda.gov/food-details/168883/nutrients) (glutinous-rice reference) |
| Mochi Reis | 370 | [USDA 168883 – Rice, white, glutinous, uncooked](https://fdc.nal.usda.gov/food-details/168883/nutrients) |
| Weiße / Rote / Schwarze Quinoa | 368 | [USDA 168874 – Quinoa, uncooked](https://fdc.nal.usda.gov/food-details/168874/nutrients) |
| Wild Reis Basmati Mix | 359 | [Reishunger Bio Wild Reis Basmati Mix](https://www.reishunger.de/produkt/1098/bio-wild-reis-basmati-mix) |
| Basmati Linsen Quinoa Mix | 359 | Estimate: mean of basmati (356, Reishunger), [lentils (352, USDA 172420)](https://fdc.nal.usda.gov/food-details/172420/nutrients) and quinoa (368, USDA 168874) |

Reishunger lists its values as average nutrients per 100 g without saying whether they're cooked or uncooked. At around 350 kcal they're clearly dry-product values, since cooked rice is around 130 kcal. Third-party calorie databases such as FatSecret were not used, because some of their Reishunger entries are cooked values (for example 247 kcal for Mochi Reis).

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

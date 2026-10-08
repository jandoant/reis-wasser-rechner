/**
 * Tiny hash router. Hash URLs need no server rewrites, so the app works on any
 * static host (Cloudflare Pages, GitHub Pages, opening the folder locally, …).
 *
 *   #/              → home
 *   #/reis/<id>     → detail for one variety
 *   #/einstellungen → settings (measuring cup)
 */

export const HOME_HREF = '#/';
export const SETTINGS_HREF = '#/einstellungen';
export const riceHref = (id) => `#/reis/${encodeURIComponent(id)}`;

/**
 * @typedef {{name: 'home'} | {name: 'settings'} | {name: 'rice', id: string} | {name: 'unknown'}} Route
 * @param {string} hash
 * @returns {Route}
 */
export function parseRoute(hash) {
  const path = hash.replace(/^#/, '') || '/';
  if (path === '/') return { name: 'home' };
  if (/^\/einstellungen\/?$/.test(path)) return { name: 'settings' };
  const match = /^\/reis\/([^/]+)\/?$/.exec(path);
  if (match) return { name: 'rice', id: decodeURIComponent(match[1]) };
  return { name: 'unknown' };
}

/**
 * Start listening to hash changes.
 * @param {(route: Route) => void} onRoute
 */
export function startRouter(onRoute) {
  const handle = () => onRoute(parseRoute(location.hash));
  window.addEventListener('hashchange', handle);
  handle();
}

/** Navigate to home without adding a history entry (used for bad URLs). */
export const redirectHome = () => location.replace(HOME_HREF);

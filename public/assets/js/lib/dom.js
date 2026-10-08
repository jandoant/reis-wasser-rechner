/**
 * Minimal, safe HTML templating: interpolated values are escaped unless they
 * come from another `html` template (or are explicitly marked with `raw`).
 */

const RAW = Symbol('raw');

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Mark a string as trusted HTML. */
export const raw = (value) => ({ [RAW]: true, value: String(value) });

function toHtml(v) {
  if (v == null || v === false) return '';
  if (Array.isArray(v)) return v.map(toHtml).join('');
  if (typeof v === 'object' && v[RAW]) return v.value;
  return escapeHtml(v);
}

/** Tagged template literal producing trusted HTML. */
export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((v, i) => { out += toHtml(v) + strings[i + 1]; });
  return raw(out);
}

/** Replace the contents of `el` with a template result. */
export function render(el, template) {
  el.innerHTML = template.value;
}

/** Query helper scoped to a root. */
export const $ = (root, selector) => root.querySelector(selector);
export const $$ = (root, selector) => [...root.querySelectorAll(selector)];

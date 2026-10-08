/**
 * Binds an <input type="number"> to a store value.
 *
 * While typing, values are only committed once they are in range, so typing
 * "150" doesn't get clamped at "1". On commit (blur / Enter) the input is
 * clamped and the field shows the normalised value.
 */
import { clampInt, parseInteger } from './calc.js';

/**
 * @param {HTMLInputElement} input
 * @param {{min: number, max: number, get: () => number, set: (n: number) => void}} options
 * @returns {{sync: () => void, destroy: () => void}}
 */
export function bindNumberField(input, { min, max, get, set }) {
  input.min = String(min);
  input.max = String(max);

  const onInput = () => {
    const n = parseInteger(input.value);
    if (n != null && n >= min && n <= max) set(n);
  };
  const onChange = () => {
    set(clampInt(input.value, min, max, get()));
    input.value = String(get());
  };
  const onKeydown = (e) => { if (e.key === 'Enter') input.blur(); };

  input.addEventListener('input', onInput);
  input.addEventListener('change', onChange);
  input.addEventListener('keydown', onKeydown);

  return {
    /** Show the current store value, unless the user is typing in this field. */
    sync() {
      if (document.activeElement !== input) input.value = String(get());
    },
    destroy() {
      input.removeEventListener('input', onInput);
      input.removeEventListener('change', onChange);
      input.removeEventListener('keydown', onKeydown);
    },
  };
}

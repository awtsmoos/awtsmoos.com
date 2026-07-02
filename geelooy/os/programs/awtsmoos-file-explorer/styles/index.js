// B"H
import futureUnified from './futureUnified.js';

export function ensureStyles() {
  let style = document.getElementById('awtsmoos-file-explorer-styles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'awtsmoos-file-explorer-styles';
    document.head.appendChild(style);
  }
  if (style.textContent !== futureUnified) style.textContent = futureUnified;
  return style;
}

export default futureUnified;
/** B"H: the named style gate returns so Explorer can breathe in browsers. */

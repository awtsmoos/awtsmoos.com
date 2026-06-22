// B"H
/**
 * @module AssetPreview
 * @description
 * Chapter 476: The composer sees its uploaded sparks before they enter the
 * world. Preview is pure DOM, so old prompt-based flows can slowly awaken into
 * full media creation without breaking legacy routes.
 */

import { renderGallery } from './renderGallery.js';

export function mountAssetPreview({ container, state, label = 'Attached media' }) {
  const target = typeof container === 'string' ? document.querySelector(container) : container;
  if (!target || !state) return null;
  target.classList.add('bh-social-asset-preview');
  return state.onChange(assets => {
    target.innerHTML = `
      <h4>${label}</h4>
      ${assets.length ? renderGallery(assets, label) : '<p>No media attached yet.</p>'}
    `;
  });
}

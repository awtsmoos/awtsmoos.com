// B"H
/**
 * @module MediaDropZone
 * @description
 * Chapter 477: Drag a file from the world into the social river. The drop zone
 * uploads and remembers assets, letting the same primitive serve posts,
 * questions, answers, comments, and OS vault surfaces.
 */

import { uploadAssetFile } from './assetUploader.js';

export function mountMediaDropZone({ element, state, aliasId, target = {} }) {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el || !state) return null;
  el.classList.add('bh-social-drop-zone');
  el.tabIndex = 0;
  el.textContent = el.textContent || 'Drop image/audio here';
  const stop = event => { event.preventDefault(); event.stopPropagation(); };
  el.addEventListener('dragover', event => { stop(event); el.classList.add('is-dragging'); });
  el.addEventListener('dragleave', event => { stop(event); el.classList.remove('is-dragging'); });
  el.addEventListener('drop', async event => {
    stop(event);
    el.classList.remove('is-dragging');
    for (const file of [...event.dataTransfer.files]) state.add(await uploadAssetFile({ aliasId, file, ...target }));
  });
  return el;
}

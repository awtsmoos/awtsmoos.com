/* B"H
 * Crop presets and crop language.
 * A crop is not destruction; it is the vessel choosing which light to reveal.
 */
import { selectedSource } from '../graph/sceneGraph.js';
import { normalizeCrop } from './stageGeometry.js';

/** Apply a centered crop that reveals the requested aspect ratio. */
export function applyCropAspect(state, ratio) {
  const source = selectedSource(state); if (!source) return null;
  source.crop = cropForAspect(source, ratio); return source;
}

/** Give the editor a clean centered safe frame. */
export function applyCenterSafeCrop(state, margin = 8) {
  const source = selectedSource(state); if (!source) return null;
  source.crop = normalizeCrop({ left:margin, top:margin, right:margin, bottom:margin }); return source;
}

/** Remove crop without moving the source. */
export function clearSelectedCrop(state) {
  const source = selectedSource(state); if (!source) return null;
  source.crop = normalizeCrop(); return source;
}

export function cropForAspect(source, ratio) {
  const srcRatio = Math.max(.01, source.w / Math.max(1, source.h));
  if (Math.abs(srcRatio - ratio) < .01) return normalizeCrop();
  return srcRatio > ratio ? sideCrop(srcRatio, ratio) : topCrop(srcRatio, ratio);
}

export function cropSummary(source) {
  const c = normalizeCrop(source?.crop || {}), active = c.left + c.top + c.right + c.bottom;
  return active ? `crop L${c.left} T${c.top} R${c.right} B${c.bottom}` : 'no crop';
}

function sideCrop(srcRatio, ratio) {
  const side = (1 - ratio / srcRatio) * 50;
  return normalizeCrop({ left:side, right:side, top:0, bottom:0 });
}
function topCrop(srcRatio, ratio) {
  const side = (1 - srcRatio / ratio) * 50;
  return normalizeCrop({ top:side, bottom:side, left:0, right:0 });
}

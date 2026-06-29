/* B"H
Source node: each layer is a small world with position, crop, sound, settings, and memory.
The crop is born harmless, awaiting the user's hand to reveal a cleaner frame.
*/
export function makeSourceNode(input = {}) {
  return {
    id:input.id, type:input.type || 'canvas', name:input.name || 'Source', node:input.node || null,
    x:Number(input.x || 0), y:Number(input.y || 0), w:Number(input.w || 320), h:Number(input.h || 180),
    rotation:Number(input.rotation || 0), opacity:input.opacity ?? 1, crop:normalizeCrop(input.crop),
    visible:input.visible !== false, locked:input.locked === true, stream:input.stream || null,
    url:input.url || '', surface:input.surface || '', stopped:false, audioOnly:input.audioOnly === true,
    videoOnly:input.videoOnly === true, mediaKind:input.mediaKind || input.type || 'source', meta:input.meta || {},
    settings:{ ...(input.settings || {}) }
  };
}

export function cloneSourceNode(source, overrides = {}) {
  return makeSourceNode({
    ...source, ...overrides,
    meta:{ ...(source.meta || {}), ...(overrides.meta || {}) },
    settings:{ ...(source.settings || {}), ...(overrides.settings || {}) }
  });
}

export function normalizeCrop(crop = {}) {
  return {
    left:clampCrop(crop.left), top:clampCrop(crop.top),
    right:clampCrop(crop.right), bottom:clampCrop(crop.bottom)
  };
}

function clampCrop(value) {
  const number = Number(value || 0);
  return Math.max(0, Math.min(90, Number.isFinite(number) ? number : 0));
}

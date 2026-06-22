/* B"H */
export function makeSourceNode(input = {}) {
  return {
    id: input.id, type: input.type || 'canvas', name: input.name || 'Source', node: input.node || null,
    x: Number(input.x || 0), y: Number(input.y || 0), w: Number(input.w || 320), h: Number(input.h || 180),
    rotation: Number(input.rotation || 0), opacity: input.opacity ?? 1, crop: input.crop || null,
    visible: input.visible !== false, locked: input.locked === true, stream: input.stream || null,
    url: input.url || '', surface: input.surface || '', stopped: false, meta: input.meta || {}
  };
}
export function cloneSourceNode(source, overrides = {}) {
  return makeSourceNode({ ...source, ...overrides, meta: { ...(source.meta || {}), ...(overrides.meta || {}) } });
}

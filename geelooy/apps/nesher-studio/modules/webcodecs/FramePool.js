/* B"H
FramePool: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createFramePool(input = {}) {
  return {
    id: input.id || `framepool-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'FramePool',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeFramePool(node) {
  return `${node.kind}:${node.status}`;
}
export function updateFramePool(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

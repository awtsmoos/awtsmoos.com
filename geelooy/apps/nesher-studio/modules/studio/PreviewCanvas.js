/* B"H
PreviewCanvas: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createPreviewCanvas(input = {}) {
  return {
    id: input.id || `previewcanvas-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'PreviewCanvas',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describePreviewCanvas(node) {
  return `${node.kind}:${node.status}`;
}
export function updatePreviewCanvas(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

/* B"H
StudioTransition: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createStudioTransition(input = {}) {
  return {
    id: input.id || `studiotransition-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'StudioTransition',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeStudioTransition(node) {
  return `${node.kind}:${node.status}`;
}
export function updateStudioTransition(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

/* B"H
HlsPublisher: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createHlsPublisher(input = {}) {
  return {
    id: input.id || `hlspublisher-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'HlsPublisher',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeHlsPublisher(node) {
  return `${node.kind}:${node.status}`;
}
export function updateHlsPublisher(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

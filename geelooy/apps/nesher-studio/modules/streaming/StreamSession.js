/* B"H
StreamSession: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createStreamSession(input = {}) {
  return {
    id: input.id || `streamsession-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'StreamSession',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeStreamSession(node) {
  return `${node.kind}:${node.status}`;
}
export function updateStreamSession(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

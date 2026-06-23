/* B"H
ReplayBuffer: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createReplayBuffer(input = {}) {
  return {
    id: input.id || `replaybuffer-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'ReplayBuffer',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeReplayBuffer(node) {
  return `${node.kind}:${node.status}`;
}
export function updateReplayBuffer(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

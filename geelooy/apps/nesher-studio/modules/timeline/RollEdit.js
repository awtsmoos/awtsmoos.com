/* B"H
RollEdit: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createRollEdit(input = {}) {
  return {
    id: input.id || `rolledit-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'RollEdit',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeRollEdit(node) {
  return `${node.kind}:${node.status}`;
}
export function updateRollEdit(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

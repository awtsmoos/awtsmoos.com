/* B"H
CustomProvider: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createCustomProvider(input = {}) {
  return {
    id: input.id || `customprovider-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'CustomProvider',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeCustomProvider(node) {
  return `${node.kind}:${node.status}`;
}
export function updateCustomProvider(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

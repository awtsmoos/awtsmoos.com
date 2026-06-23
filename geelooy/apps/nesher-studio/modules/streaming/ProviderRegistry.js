/* B"H
ProviderRegistry: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createProviderRegistry(input = {}) {
  return {
    id: input.id || `providerregistry-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'ProviderRegistry',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeProviderRegistry(node) {
  return `${node.kind}:${node.status}`;
}
export function updateProviderRegistry(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

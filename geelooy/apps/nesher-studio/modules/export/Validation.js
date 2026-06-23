/* B"H
Validation: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createValidation(input = {}) {
  return {
    id: input.id || `validation-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'Validation',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeValidation(node) {
  return `${node.kind}:${node.status}`;
}
export function updateValidation(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

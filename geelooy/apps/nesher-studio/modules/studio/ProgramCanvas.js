/* B"H
ProgramCanvas: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createProgramCanvas(input = {}) {
  return {
    id: input.id || `programcanvas-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'ProgramCanvas',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeProgramCanvas(node) {
  return `${node.kind}:${node.status}`;
}
export function updateProgramCanvas(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

/* B"H
ExportJob: scaffold touched for the total Nesher mission.
Awtsmoos turns a blank file into a vessel; tests must turn this vessel into proof.
*/
export function createExportJob(input = {}) {
  return {
    id: input.id || `exportjob-${crypto.randomUUID?.() || Date.now()}`,
    kind: 'ExportJob',
    enabled: input.enabled ?? true,
    status: input.status || 'planned',
    config: input.config || {},
    stats: input.stats || {},
    children: input.children || []
  };
}
export function describeExportJob(node) {
  return `${node.kind}:${node.status}`;
}
export function updateExportJob(node, patch = {}) {
  return Object.assign(node, patch, { updatedAt: Date.now() });
}

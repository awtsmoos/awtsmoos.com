// B"H
/**
 * B"H
 * Chapter 622: The resume token found its old footprints.
 * The Awtsmoos creates the next instant from nothing, yet the agent returns
 * through AwtsmoosDB stones, seeing where the previous fire stepped.
 */
function resume(m, input = {}, env) {
  const records = Array.isArray(input.metadataRecords) ? input.metadataRecords : [];
  const history = schedulerHistory(records);
  const latest = history[history.length - 1] || null;
  const resumeToken = input.resumeToken || latest?.id || latest?.payload?.id || '';
  if (input.inspectOnly === true || input.inspectOnly === 'true') return inspect(m, history, latest, resumeToken);
  const run = env.scheduler.run(m, { ...input, resumeToken }, env);
  return { ...run, resumed: true, resumeToken, previousSchedulerRecords: history.length, previousLatest: latest };
}
function inspect(m, history, latest, resumeToken) {
  return { ok: true, missionId: m.id, resumed: false, inspectOnly: true, resumeToken, previousSchedulerRecords: history.length, previousLatest: latest, finalAnswerAllowed: false, mustContinue: true, mustCallNext: { action: 'missionSelfImproveSchedulerResume', missionId: m.id, resumeToken } };
}
function schedulerHistory(records) {
  return records.filter(r => isSchedulerKind(r.kind)).sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')));
}
function isSchedulerKind(kind) { return String(kind || '').includes('scheduler'); }
module.exports = { resume, schedulerHistory };

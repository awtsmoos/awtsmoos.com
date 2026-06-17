// B"H
export function collectWorldTimingLog(win = globalThis.window) {
  const progress = win?.__AWTSMOOS_WORKER_PROGRESS__ || {};
  const payloads = win?.__AWTSMOOS_WORKER_PROGRESS_PAYLOADS__ || [];
  const report = win?.__AWTSMOOS_WORLD_REPORT__?.() || win?.__AWTSMOOS_LAST_WORLD_REPORT__ || null;
  const marks = payloads.map(x => ({ stage:x.stage, at:x.at, elapsed:x.payload?.elapsedMs || x.payload?.postbuild?.elapsedMs || null })).filter(x => x.stage);
  return { at:Date.now(), ready:win?.document?.readyState || null, href:win?.location?.href || null, lastStage:progress.lastStage || null, payloadCount:payloads.length, worldReport:report, marks };
}
export default collectWorldTimingLog;

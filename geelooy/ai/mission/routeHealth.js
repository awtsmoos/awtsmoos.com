// B"H
const { clone, nowIso } = require("./state");
function makeRouteHealth(expectation = {}) {
  return { expectation, samples: [], failures: [], status: "unknown" };
}
function recordRouteSample(health, result = {}) {
  const next = clone(health || makeRouteHealth());
  const sample = {
    action: result.actualAction || result.action || null,
    requestAction: result.requestAction || null,
    tunnelName: result.tunnelName || null,
    vessel: result.vessel || null,
    routeReason: result.routeReason || null,
    ok: result.ok !== false,
    createdAt: nowIso()
  };
  next.samples.push(sample);
  if (!sample.ok || /virtual/.test(String(sample.routeReason || sample.vessel))) next.failures.push(sample);
  next.status = next.failures.length ? "degraded" : "healthy";
  return next;
}
function shouldThrottle(health) {
  const recent = (health.failures || []).slice(-3);
  return recent.length >= 2;
}
module.exports = { makeRouteHealth, recordRouteSample, shouldThrottle };

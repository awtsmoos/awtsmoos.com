// B"H
function clean(value) { return value == null ? null : String(value); }
function correlationMismatch(expected = {}, actual = {}) {
  const expAction = clean(expected.expectedAction || expected.action || expected.requestAction);
  const actAction = clean(actual.actualAction || actual.action || actual.requestAction);
  const expTunnel = clean(expected.expectedTunnelName || expected.tunnelName);
  const actTunnel = clean(actual.actualTunnelName || actual.tunnelName);
  const expVessel = clean(expected.expectedVessel || expected.vessel);
  const actVessel = clean(actual.actualVessel || actual.vessel);
  const mismatches = [];
  if (expAction && actAction && expAction !== actAction) mismatches.push("action");
  if (expTunnel && actTunnel && expTunnel !== actTunnel) mismatches.push("tunnelName");
  if (expVessel && actVessel && expVessel !== actVessel) mismatches.push("vessel");
  if (expected.controlRequestId && actual.controlRequestId && expected.controlRequestId !== actual.controlRequestId) mismatches.push("controlRequestId");
  if (expVessel === "native-tunnel" && actual.routeReason && !/native/.test(String(actual.routeReason))) mismatches.push("routeReason");
  return mismatches;
}
function validateCorrelation(expected = {}, actual = {}) { const mismatches = correlationMismatch(expected, actual); return mismatches.length ? { ok: false, correlationMismatch: true, mismatches, expected, actual } : { ok: true, correlationMismatch: false, expected, actual }; }
module.exports = { validateCorrelation, correlationMismatch };

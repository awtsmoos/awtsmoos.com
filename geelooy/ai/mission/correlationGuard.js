// B"H
const NATIVE_ROUTE_REASONS = new Set(["native", "native_tunnel", "native-tunnel", "native_route", "native-route"]);
function clean(value) { return value == null || value === "" ? null : String(value); }
function actualValue(actual, keys) {
  for (const key of keys) {
    const value = clean(actual[key]);
    if (value) return value;
  }
  return null;
}
function expectMatch(mismatches, label, expectedValue, actualValue) {
  if (!expectedValue) return;
  if (!actualValue || expectedValue !== actualValue) mismatches.push(label);
}
function isNativeRouteReason(value) { return NATIVE_ROUTE_REASONS.has(String(value || "").toLowerCase()); }
function isVirtual(value) { return /virtual-os|explicit_virtual_os/.test(String(value || "").toLowerCase()); }
function correlationMismatch(expected = {}, actual = {}) {
  const expAction = clean(expected.expectedAction || expected.action || expected.requestAction);
  const actAction = actualValue(actual, ["actualAction", "action", "requestAction"]);
  const expTunnel = clean(expected.expectedTunnelName || expected.tunnelName);
  const actTunnel = actualValue(actual, ["actualTunnelName", "tunnelName"]);
  const expVessel = clean(expected.expectedVessel || expected.vessel);
  const actVessel = actualValue(actual, ["actualVessel", "vessel"]);
  const expControl = clean(expected.controlRequestId);
  const actControl = clean(actual.controlRequestId);
  const routeReason = clean(actual.routeReason);
  const mismatches = [];
  expectMatch(mismatches, "action", expAction, actAction);
  expectMatch(mismatches, "tunnelName", expTunnel, actTunnel);
  expectMatch(mismatches, "vessel", expVessel, actVessel);
  expectMatch(mismatches, "controlRequestId", expControl, actControl);
  if (expVessel === "native-tunnel" || expected.native === true) {
    if (!isNativeRouteReason(routeReason)) mismatches.push("routeReason");
    if (isVirtual(actTunnel)) mismatches.push("virtualTunnelName");
    if (isVirtual(actVessel)) mismatches.push("virtualVessel");
    if (isVirtual(routeReason)) mismatches.push("virtualRouteReason");
  }
  return Array.from(new Set(mismatches));
}
function validateCorrelation(expected = {}, actual = {}) {
  const mismatches = correlationMismatch(expected, actual);
  return mismatches.length ? { ok: false, correlationMismatch: true, mismatches, expected, actual } : { ok: true, correlationMismatch: false, expected, actual };
}
module.exports = { validateCorrelation, correlationMismatch };

// B"H
const DIRECT = ['userStop','safetyBlock','leaseExpired','fatalCorruption','toolAccessLost'];
const TESTING = 'testingEmergencyStop';
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'yes'; }
function testingStop(input = {}) {
  const reason = String(input.reason || input.emergencyReason || '').trim();
  if (!truthy(input.emergencyStop) || !truthy(input.testing)) return '';
  return reason.length >= 12 ? TESTING : '';
}
/**
 * B"H — Emergency stop is a narrow safety valve, not a way to get tired.
 * The tunnel supports the agent when reality is unsafe or a test must stop,
 * but ordinary completion remains a checkpoint that asks for the next step.
 */
function exceptionStop(input = {}) { return DIRECT.find(name => truthy(input[name])) || testingStop(input) || ''; }
function emergencyAllowed(input = {}) { return !!exceptionStop(input); }
module.exports = { DIRECT, TESTING, truthy, exceptionStop, emergencyAllowed };

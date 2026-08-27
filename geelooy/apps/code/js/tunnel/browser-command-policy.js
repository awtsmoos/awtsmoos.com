// B"H
export const BROWSER_VIRTUAL_COMMANDS = Object.freeze([
  'pwd', 'ls', 'tree', 'cat', 'head', 'tail', 'grep', 'rg', 'find', 'echo', 'help', 'clear'
]);
export const UNSUPPORTED_BROWSER_COMMAND_MESSAGE = 'This Code vessel cannot run local shell commands directly. It can run supported Merkava virtual commands or delegate to a native tunnel if connected.';
export function commandModeData(mode) {
  return { commandMode: mode, vesselType: 'awtsmoos-code', supportedCommands: [...BROWSER_VIRTUAL_COMMANDS] };
}
export function browserFallbackReceipt(payload = {}, overrides = {}) {
  const action = payload.requestAction || payload.action || 'commandRun';
  return {
    receiptId: overrides.receiptId || `receipt_${Date.now().toString(36)}`,
    requestAction: action,
    actualAction: payload.actualAction || action,
    targetTunnelName: overrides.targetTunnelName || payload.targetTunnelName || payload.tunnelName || '',
    targetVesselType: overrides.targetVesselType || 'native-local',
    fallbackVesselType: 'awtsmoos-code',
    status: overrides.status || 'queued_waiting_for_native_tunnel',
    createdAt: overrides.createdAt || new Date().toISOString(),
    command: payload.command || payload.text || '',
    safeToReplay: overrides.safeToReplay === true,
    requiresConfirmation: overrides.requiresConfirmation !== false
  };
}
export function unsupportedCommandError(name = '', payload = {}) {
  const error = new Error(`Unsupported browser command: ${name}. ${UNSUPPORTED_BROWSER_COMMAND_MESSAGE}`);
  error.code = 'browser_command_not_native';
  error.commandMode = 'unsupported';
  error.receipt = browserFallbackReceipt({ ...payload, action: 'commandRun', requestAction: 'commandRun' });
  error.recovery = { fallback: 'queue_for_native_tunnel' };
  return error;
}
export function helpText() {
  return `Supported browser commands:\n${BROWSER_VIRTUAL_COMMANDS.join('\n')}\n\n${UNSUPPORTED_BROWSER_COMMAND_MESSAGE}`;
}

// B"H
/**
 * B"H
 * A browser cannot swing the native sword. It can only hand a signed request to
 * the native tunnel gate, preserving commandRun identity and asking for compact
 * trust back from the real worker vessel.
 */
export function canDelegateNative(payload = {}) { return payload.allowNative === true && payload.nativeTunnel && typeof payload.nativeTunnel.send === 'function'; }
export function nativeCommandPayload(command = '', cwd = '.', payload = {}) {
  return { action: 'commandRun', requestAction: 'commandRun', actualAction: 'commandRun', command, cwd, tunnelName: payload.targetTunnelName || payload.tunnelName || '', responseMode: 'compact', fromVessel: 'browser-tab' };
}
export async function delegateNativeCommand(command, cwd, payload = {}) {
  if (!canDelegateNative(payload)) return null;
  return await payload.nativeTunnel.send(nativeCommandPayload(command, cwd, payload));
}

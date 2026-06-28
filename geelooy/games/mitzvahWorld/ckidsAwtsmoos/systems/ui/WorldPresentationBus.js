// B"H
/**
 * WorldPresentationBus
 *
 * The Presentation Layer publishes events and UI payloads. Simulation systems
 * should not each invent their own dispatch ritual. This keeps HUD updates and
 * test probes consistent while remaining cheap and browser-safe.
 */
export function customEvent(type, detail) { const Ctor = globalThis.CustomEvent; return Ctor ? new Ctor(type, { detail }) : { type, detail }; }
export function publish(scope = globalThis, type = 'mitzvah-world:event', detail = {}, options = {}) {
  if (options.emit === false) return detail;
  scope?.dispatchEvent?.(customEvent(type, detail));
  if (options.alsoGlobal && scope !== globalThis) globalThis.dispatchEvent?.(customEvent(type, detail));
  return detail;
}
export function publishLivingWorld(scope = globalThis, type = 'step', payload = {}, options = {}) { return publish(scope, 'mitzvah-world:living-world', { type, payload }, options); }
export function publishUiPayload(store = {}, key = 'payload', payload = {}) {
  store.uiPayloads ||= {};
  store.uiPayloads[key] = payload;
  return payload;
}
export function receiveUi(scope = globalThis, key = 'payload', payload = {}) { scope?.__MITZVAH_UI_BRIDGE__?.receive?.(key, payload); return payload; }
export default { customEvent, publish, publishLivingWorld, publishUiPayload, receiveUi };

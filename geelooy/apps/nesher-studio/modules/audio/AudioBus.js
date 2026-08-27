/* B"H
An audio bus is a riverbed: gain, mute, solo, meters, and routes. It is pure
first, so browser AudioContext wiring can enter without breaking tests.
*/
export function createAudioBus(input = {}) {
  return { id:input.id || id('bus'), kind:'AudioBus', name:input.name || 'Bus', gain:Number(input.gain ?? 1), muted:!!input.muted, solo:!!input.solo, channels:input.channels || 2, inputs:input.inputs || [], outputs:input.outputs || [], meter:{ peak:0, rms:0 }, node:input.node || null };
}
export function routeBus(from, to) { if (!from.outputs.includes(to.id)) from.outputs.push(to.id); if (!to.inputs.includes(from.id)) to.inputs.push(from.id); return { from:from.id, to:to.id }; }
export function setBusGain(bus, gain) { bus.gain = Math.max(0, Number(gain)); return bus; }
export function busAudible(bus, soloActive = false) { return !bus.muted && (!soloActive || bus.solo); }
function id(prefix) { return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`; }

// B"H
/** Procedural wheels sing: creak, wind, engine, all distance-aware. */
export function updateVehicleSound(state) {
  const v = state.activeVehicle;
  if (!v || !globalThis.AudioContext) return;
  if (!state.audio) {
    const ctx = new AudioContext(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = "sawtooth"; osc.connect(gain); gain.connect(ctx.destination); osc.start();
    state.audio = { ctx, osc, gain };
  }
  const speed = Math.abs(v.velocity || 0);
  const kind = v.vehicleType;
  state.audio.osc.frequency.value = (kind === "car" ? 70 : kind === "chariot" ? 140 : 95) + speed * 9;
  state.audio.gain.gain.value = Math.min(.12, .015 + speed / 220);
}

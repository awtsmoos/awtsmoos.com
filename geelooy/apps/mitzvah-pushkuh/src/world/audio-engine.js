// B"H
// Audio is opt-in breath; gestures may awaken it, but silence is honored.
export function createAudioEngine() {
  let ctx, gain, ready = false;
  function unlock() {
    if (ready || typeof AudioContext === "undefined") return; ctx = new AudioContext(); gain = ctx.createGain(); gain.gain.value = .025; gain.connect(ctx.destination); ready = true;
  }
  function pulse(power = 1) {
    if (!ready) return; const o = ctx.createOscillator(); o.frequency.value = 180 + power * 90; o.connect(gain); o.start(); o.stop(ctx.currentTime + .08);
  }
  return { unlock, pulse };
}

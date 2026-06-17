/* B"H
Chorus is the river where one note sees many shimmering faces.
*/

export function createChorus(ctx, destination) {
    const input = ctx.createGain();
    const delay = ctx.createDelay();
    const depth = ctx.createGain();
    const lfo = ctx.createOscillator();
    const wet = ctx.createGain();
    delay.delayTime.value = 0.018;
    depth.gain.value = 0.006;
    lfo.frequency.value = 0.28;
    wet.gain.value = 0.35;
    input.connect(delay);
    delay.connect(wet);
    wet.connect(destination);
    lfo.connect(depth);
    depth.connect(delay.delayTime);
    lfo.start();
    return { input, delay, depth, lfo, wet };
}

export function setChorusAmount(chorus, amount, time) {
    if (!chorus?.wet) return;
    chorus.wet.gain.setTargetAtTime(Math.max(0, Math.min(0.8, amount)), time, 0.03);
}

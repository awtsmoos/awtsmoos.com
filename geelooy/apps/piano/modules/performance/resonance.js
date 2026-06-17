/* B"H
Resonance is the memory of neighboring strings remembering the note after impact.
*/
const recent = new Map();
export function rememberStrike(noteName, time, velocity) { recent.set(noteName, { time, velocity }); prune(time); }
export function repetitionFactor(noteName, time) {
    const last = recent.get(noteName);
    if (!last) return 1;
    const gap = Math.max(0, time - last.time);
    return gap < 0.18 ? 0.72 + gap * 1.5 : 1;
}
export function createSympatheticResonance(ctx, destination, frequency, pedalDown, velocity) {
    if (!pedalDown) return null;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = frequency * 2;
    gain.gain.value = 0.018 * velocity;
    osc.connect(gain); gain.connect(destination);
    return { osc, gain };
}
function prune(now) { recent.forEach((v,k) => { if (now - v.time > 3) recent.delete(k); }); }

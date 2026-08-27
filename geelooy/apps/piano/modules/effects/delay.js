/* B"H
Delay is an echo corridor: the note walks forward and meets its own future, but the gate keeps the hall clean.
*/
export function createDelayRack(ctx, destination) {
    const input = ctx.createGain(), delay = ctx.createDelay(2), feedback = ctx.createGain(), wet = ctx.createGain(), tone = ctx.createBiquadFilter();
    delay.delayTime.value = 0.26; feedback.gain.value = 0.18; wet.gain.value = 0;
    tone.type = 'lowpass'; tone.frequency.value = 5200; tone.Q.value = 0.4;
    input.connect(delay); delay.connect(tone); tone.connect(feedback); feedback.connect(delay); tone.connect(wet); wet.connect(destination);
    return { input, delay, feedback, wet, tone };
}
export function setDelay(rack, amount, time, delayTime = 0.26, feedback = 0.18) {
    if (!rack?.wet) return;
    rack.wet.gain.setTargetAtTime(Math.max(0, Math.min(.75, amount)), time, .04);
    rack.delay.delayTime.setTargetAtTime(Math.max(.05, Math.min(.9, delayTime)), time, .04);
    rack.feedback.gain.setTargetAtTime(Math.max(0, Math.min(.82, feedback)), time, .04);
}

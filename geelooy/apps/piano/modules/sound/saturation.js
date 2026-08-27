/* B"H
Saturation is sunlight folded into copper: warmth without collapse.
*/

export function createSaturator(ctx, drive = 1.5) {
    const shaper = ctx.createWaveShaper();
    shaper.curve = makeCurve(drive);
    shaper.oversample = '4x';
    return shaper;
}

function makeCurve(drive) {
    const n = 2048;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = Math.tanh(x * drive);
    }
    return curve;
}

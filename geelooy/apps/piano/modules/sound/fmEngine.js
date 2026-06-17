/* B"H
FM is where glass learns to sing: several sparks orbit the carrier, each revealing another metallic vowel.
*/

const TONE_PARTIALS = {
    glass: [[2, 0.72], [3, 0.34], [5, 0.16]],
    bright: [[3, 1.0], [5, 0.46], [7, 0.18]],
    warm: [[2, 0.48], [4, 0.2]],
    bark: [[2, 0.58], [6, 0.32], [9, 0.18]],
    pad: [[1.5, 0.22], [2, 0.16], [3, 0.08]]
};

export function createFmPair(ctx, carrier, frequency, preset, velocity) {
    const partials = TONE_PARTIALS[preset.fmTone] || [[preset.fmRatio || 2, 1]];
    const voices = partials.map(([ratio, weight], index) => {
        const modulator = ctx.createOscillator();
        const depth = ctx.createGain();
        modulator.type = index === 0 ? 'sine' : 'triangle';
        modulator.frequency.value = frequency * ratio;
        depth.gain.value = frequency * preset.fmIndex * velocity * weight;
        modulator.connect(depth);
        depth.connect(carrier.frequency);
        return { modulator, depth };
    });
    return { voices };
}

export function startFm(fm, time) {
    fm?.voices?.forEach(voice => voice.modulator.start(time));
}

export function stopFm(fm, time) {
    fm?.voices?.forEach(voice => {
        try { voice.modulator.stop(time); } catch (_) {}
    });
}

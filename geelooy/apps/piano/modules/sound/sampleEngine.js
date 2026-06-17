/* B"H
Sample hooks wait like empty golden rooms for Rhodes, Wurli, grand, and thunder.
*/

export const sampleRegistry = new Map();

export function registerSample(name, note, buffer) {
    if (!sampleRegistry.has(name)) sampleRegistry.set(name, new Map());
    sampleRegistry.get(name).set(note, buffer);
}

export function createSampleVoice(ctx, destination, preset, noteName) {
    const bank = sampleRegistry.get(preset.sampleBank);
    const buffer = bank?.get(noteName);
    if (!buffer) return null;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.value = 0.8;
    source.connect(gain);
    gain.connect(destination);
    return { source, gain };
}

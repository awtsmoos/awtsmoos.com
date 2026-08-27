/* B"H
A real key begins with a tiny bright spark: hammer, tine, breath, becoming.
*/

export function createTransient(ctx, destination, frequency, velocity, preset) {
    const noise = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const length = Math.max(1, Math.floor(ctx.sampleRate * preset.transientMs / 1000));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    noise.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = Math.min(12000, frequency * 10);
    filter.Q.value = 5;
    gain.gain.value = preset.transientGain * velocity;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    return { noise, gain };
}

export function startTransient(nodes, time) {
    if (!nodes?.noise) return;
    nodes.noise.start(time);
    nodes.noise.stop(time + 0.04);
}

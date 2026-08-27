/* B"H */
export function createWaveformScope(input = {}) { return { kind:'WaveformScope', points:input.points || [] }; }
export function buildWaveform(pixels = [], width = 1) { return createWaveformScope({ points:pixels.map((p, i) => ({ x:i % width, y:.2126*p[0]+.7152*p[1]+.0722*p[2] })) }); }

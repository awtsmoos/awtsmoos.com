/* B"H */
export function createAudioWaveform(input = {}) { return { kind:'AudioWaveform', peaks:input.peaks || [], resolution:input.resolution || 256 }; }
export function extractWaveform(samples, resolution = 256) { const peaks = []; const step = Math.max(1, Math.ceil((samples?.length || 0) / resolution)); for (let i = 0; i < (samples?.length || 0); i += step) peaks.push(Math.max(...Array.from(samples.slice(i, i + step), v => Math.abs(v)))); return createAudioWaveform({ peaks, resolution }); }

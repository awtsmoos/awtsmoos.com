/* B"H */
export function createAACEncoder(input = {}) { return { kind:'AACEncoder', codec:input.codec || 'mp4a.40.2', sampleRate:input.sampleRate || 48000, numberOfChannels:input.channels || input.numberOfChannels || 2, bitrate:input.bitrate || 128000 }; }
export function aacConfigFromPreset(preset = {}) { return createAACEncoder({ bitrate:preset.audioBitrate, sampleRate:preset.sampleRate, channels:preset.channels }); }

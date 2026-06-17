/* B"H */
self.AwtsVideoBase = self.AwtsVideoBase || {};
self.AwtsVideoBase.createOutput = function createOutput(api) {
    return new api.Output({ format: new api.Mp4OutputFormat(), target: new api.BufferTarget() });
};
self.AwtsVideoBase.pickVideoCodec = async function pickVideoCodec(api, output, resolution) {
    try { return await api.getFirstEncodableVideoCodec(output.format.getSupportedCodecs(), resolution); }
    catch (e) { console.warn('Dynamic video codec check failed, using default.', e.message); return 'avc1.42001E'; }
};
self.AwtsVideoBase.createVideoSource = function createVideoSource(api, codec, outputFormat) {
    return new api.VideoSampleSource({ codec, bitrate: (outputFormat.quality || 0.5) * 8_000_000 });
};
self.AwtsVideoBase.createAudioSource = api => new api.AudioBufferSource({ codec: 'aac', bitrate: 128_000 });

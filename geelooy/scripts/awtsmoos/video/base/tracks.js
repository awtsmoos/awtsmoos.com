/* B"H
Tracks: fast H.264/AAC, valid normal MP4, low-RAM random-access IndexedDB target when available.
*/
self.AwtsVideoBase = self.AwtsVideoBase || {};
self.AwtsVideoBase.createOutput = function createOutput(api) {
    const format = new api.Mp4OutputFormat({ fastStart: 'in-memory' });
    const idbTarget = AwtsVideoBase.createIdbRangeTarget?.(api, 'video/mp4');
    return new api.Output({ format, target: idbTarget || new api.BufferTarget() });
};
self.AwtsVideoBase.pickVideoCodec = async function pickVideoCodec(api, output, resolution) {
    const codecs = ['avc1.42001E', 'avc1.4D401E', 'avc1.64001E'];
    for (const codec of codecs) {
        try { if (await api.canEncodeVideo(codec, { width: resolution.width, height: resolution.height })) return codec; } catch (_) {}
    }
    try { return await api.getFirstEncodableVideoCodec(output.format.getSupportedCodecs(), resolution); }
    catch (e) { console.warn('Dynamic video codec check failed, using AVC baseline fallback.', e.message); return 'avc1.42001E'; }
};
self.AwtsVideoBase.createVideoSource = function createVideoSource(api, codec, outputFormat) {
    const quality = Number.isFinite(outputFormat.quality) ? outputFormat.quality : 0.55;
    const bitrate = outputFormat.bitrate || Math.round(Math.max(800_000, Math.min(3_500_000, quality * 4_500_000)));
    return new api.VideoSampleSource({ codec, bitrate });
};
self.AwtsVideoBase.createAudioSource = api => new api.AudioBufferSource({ codec: 'aac', bitrate: 96_000 });

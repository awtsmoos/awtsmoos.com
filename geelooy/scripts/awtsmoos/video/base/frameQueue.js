/* B"H */
self.AwtsVideoBase = self.AwtsVideoBase || {};
self.AwtsVideoBase.addCanvasFrame = async function addCanvasFrame(instance, framePayload) {
    while (instance.frameQueue.length >= instance.maxCacheFrames) await new Promise(r => setTimeout(r, 10));
    await instance.frameDrawingFunction({ payload: instance.config, ctx: instance.ctx, canvas: instance.canvas }, framePayload);
    const frame = new VideoFrame(instance.canvas, {
        timestamp: Math.max(0, Math.round(framePayload.time * 1_000_000)),
        duration: Math.max(1, Math.round(framePayload.duration * 1_000_000))
    });
    instance.frameQueue.push(new instance.mediabunny.VideoSample(frame));
    instance.lastQueuedTime = framePayload.time + framePayload.duration;
    if (!instance.isEncoding) instance._processFrameQueue();
};
self.AwtsVideoBase.processFrameQueue = async function processFrameQueue(instance) {
    if (instance.isEncoding) return;
    instance.isEncoding = true;
    try {
        while (instance.frameQueue.length) {
            const sample = instance.frameQueue.shift();
            await instance.videoSampleSource.add(sample);
            sample.close();
        }
    } catch (e) {
        instance._postFatalError(`Frame encoding failed: ${e.message}`, e);
        instance.frameQueue.forEach(sample => sample.close());
        instance.frameQueue = [];
    } finally { instance.isEncoding = false; }
};

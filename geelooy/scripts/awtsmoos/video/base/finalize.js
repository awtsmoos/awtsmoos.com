/* B"H
Finalize: IDB range target returns a valid Blob without BufferTarget's giant RAM buffer.
*/
self.AwtsVideoBase = self.AwtsVideoBase || {};
self.AwtsVideoBase.finalizeOutput = async function finalizeOutput(instance, audioBufferShim) {
    instance._postStatus('Finalizing video track...');
    const timeRemaining = audioBufferShim.duration - instance.lastQueuedTime;
    if (timeRemaining > 0.001) await instance.addFrame({ time: instance.lastQueuedTime, duration: timeRemaining });
    while (instance.frameQueue.length || instance.isEncoding) {
        if (!instance.isEncoding && instance.frameQueue.length) instance._processFrameQueue();
        await new Promise(resolve => setTimeout(resolve, 40));
    }
    instance.videoSampleSource.close();
    instance._postStatus('Encoding audio...');
    await instance.audioBufferSource.add(new self.AudioBuffer(audioBufferShim));
    instance.audioBufferSource.close();
    instance._postStatus('Muxing playable MP4 file...');
    await instance.output.finalize();
    const target = instance.output.target;
    if (target.awtsmoosIdbRangeSession) return AwtsVideoBase.idbRangeTargetToBlob(target);
    return new Blob([target.buffer], { type: instance.output.format.mimeType || 'video/mp4' });
};

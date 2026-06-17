/* B"H
Targets: the river of encoded MP4 bytes flows into IndexedDB instead of swelling RAM.
*/
self.AwtsVideoBase = self.AwtsVideoBase || {};
self.AwtsVideoBase.createOutput = function createOutput(api) {
    const format = new api.Mp4OutputFormat();
    const stream = self.AwtsVideoBase.createIndexedDbStreamTarget(api, format.mimeType || 'video/mp4');
    if (stream) return new api.Output({ format, target: stream.target });
    return new api.Output({ format, target: new api.BufferTarget() });
};
self.AwtsVideoBase.pickVideoCodec = async function pickVideoCodec(api, output, resolution) {
    const preferred = ['avc1.42001E', 'avc1.4D401E', 'avc1.64001E'];
    for (const codec of preferred) {
        try { if (await api.canEncodeVideo(codec, { width: resolution.width, height: resolution.height })) return codec; } catch (_) {}
    }
    try { return await api.getFirstEncodableVideoCodec(output.format.getSupportedCodecs(), resolution); }
    catch (e) { console.warn('Dynamic video codec check failed, using default.', e.message); return 'avc1.42001E'; }
};
self.AwtsVideoBase.createVideoSource = function createVideoSource(api, codec, outputFormat) {
    const bitrate = outputFormat.bitrate || Math.max(900_000, Math.min(4_000_000, (outputFormat.quality || 0.55) * 5_000_000));
    return new api.VideoSampleSource({ codec, bitrate });
};
self.AwtsVideoBase.createAudioSource = api => new api.AudioBufferSource({ codec: 'aac', bitrate: 96_000 });
self.AwtsVideoBase.createIndexedDbStreamTarget = function createIndexedDbStreamTarget(api, mimeType) {
    if (!api.StreamTarget || !self.indexedDB || typeof WritableStream === 'undefined') return null;
    const sessionId = 'video-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    let index = 0, chain = Promise.resolve();
    const target = new api.StreamTarget(new WritableStream({
        write(chunk) {
            const blob = chunk instanceof Blob ? chunk : new Blob([chunk], { type: mimeType });
            chain = chain.then(() => self.AwtsVideoBase.idbPutChunk(sessionId, index++, blob));
            return chain;
        },
        close() { return chain; }
    }));
    target.awtsmoosIdbSession = sessionId;
    target.awtsmoosMimeType = mimeType;
    target.awtsmoosWait = () => chain;
    return { target, sessionId };
};
self.AwtsVideoBase.idbOpen = function idbOpen() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('BH_VIDEO_STREAM_PARTS', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('chunks', { keyPath: ['sessionId', 'index'] });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};
self.AwtsVideoBase.idbStore = async function idbStore(mode, fn) {
    const db = await self.AwtsVideoBase.idbOpen();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('chunks', mode);
        const store = tx.objectStore('chunks');
        const result = fn(store);
        tx.oncomplete = () => { db.close(); resolve(result); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
};
self.AwtsVideoBase.idbPutChunk = function idbPutChunk(sessionId, index, blob) {
    return self.AwtsVideoBase.idbStore('readwrite', store => store.put({ sessionId, index, blob }));
};
self.AwtsVideoBase.idbReadChunks = async function idbReadChunks(sessionId) {
    const rows = [];
    await self.AwtsVideoBase.idbStore('readonly', store => {
        const range = IDBKeyRange.bound([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER]);
        const req = store.openCursor(range);
        req.onsuccess = () => { const cursor = req.result; if (cursor) { rows.push(cursor.value); cursor.continue(); } };
    });
    return rows.sort((a, b) => a.index - b.index).map(row => row.blob);
};
self.AwtsVideoBase.idbClearChunks = function idbClearChunks(sessionId) {
    return self.AwtsVideoBase.idbStore('readwrite', store => {
        const range = IDBKeyRange.bound([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER]);
        store.delete(range);
    });
};

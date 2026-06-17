/* B"H
Random-access IndexedDB target for Mediabunny StreamTarget.
It honors { position, data } writes, including MP4 header patches.
*/
self.AwtsVideoBase = self.AwtsVideoBase || {};
AwtsVideoBase.createIdbRangeSession = function createIdbRangeSession(mimeType) {
    return {
        sessionId: 'bh-video-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        mimeType: mimeType || 'video/mp4',
        nextId: 0,
        chain: Promise.resolve(),
        extents: [],
        maxEnd: 0
    };
};
AwtsVideoBase.createIdbRangeTarget = function createIdbRangeTarget(api, mimeType) {
    if (!api.StreamTarget || !self.indexedDB || typeof WritableStream === 'undefined') return null;
    const session = AwtsVideoBase.createIdbRangeSession(mimeType);
    const writable = new WritableStream({
        write(chunk) {
            session.chain = session.chain.then(() => AwtsVideoBase.handleIdbRangeWrite(session, chunk));
            return session.chain;
        },
        close() { return session.chain; },
        abort() { return AwtsVideoBase.idbClearVideoSession(session.sessionId); }
    });
    const target = new api.StreamTarget(writable, { chunked: true, chunkSize: 2 * 1024 * 1024 });
    target.awtsmoosIdbRangeSession = session;
    return target;
};
AwtsVideoBase.handleIdbRangeWrite = async function handleIdbRangeWrite(session, chunk) {
    if (!chunk || chunk.type !== 'write' || !chunk.data) return;
    const position = Number(chunk.position || 0);
    const data = chunk.data instanceof Uint8Array ? chunk.data : new Uint8Array(chunk.data);
    if (!data.byteLength) return;
    const id = session.nextId++;
    await AwtsVideoBase.idbPutVideoWrite(session.sessionId, id, position, data);
    AwtsVideoBase.insertIdbExtent(session, { id, start: position, end: position + data.byteLength, offset: 0 });
    session.maxEnd = Math.max(session.maxEnd, position + data.byteLength);
};
AwtsVideoBase.insertIdbExtent = function insertIdbExtent(session, incoming) {
    const result = [];
    for (const ex of session.extents) {
        if (ex.end <= incoming.start || ex.start >= incoming.end) { result.push(ex); continue; }
        if (ex.start < incoming.start) result.push({ ...ex, end: incoming.start });
        if (ex.end > incoming.end) result.push({ ...ex, start: incoming.end, offset: ex.offset + (incoming.end - ex.start) });
    }
    result.push(incoming);
    result.sort((a, b) => a.start - b.start || a.id - b.id);
    session.extents = result;
};
AwtsVideoBase.idbRangeTargetToBlob = async function idbRangeTargetToBlob(target) {
    const session = target.awtsmoosIdbRangeSession;
    await session.chain;
    const parts = [];
    let cursor = 0;
    for (const ex of session.extents.sort((a, b) => a.start - b.start)) {
        if (ex.start > cursor) parts.push(new Uint8Array(ex.start - cursor));
        const row = await AwtsVideoBase.idbGetVideoWrite(session.sessionId, ex.id);
        if (row?.blob) parts.push(row.blob.slice(ex.offset, ex.offset + (ex.end - ex.start)));
        cursor = ex.end;
    }
    if (cursor < session.maxEnd) parts.push(new Uint8Array(session.maxEnd - cursor));
    const blob = new Blob(parts, { type: session.mimeType });
    await AwtsVideoBase.idbClearVideoSession(session.sessionId);
    return blob;
};

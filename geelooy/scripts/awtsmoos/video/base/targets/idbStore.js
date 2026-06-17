/* B"H
IndexedDB storage primitives for the MP4 range target.
Each byte range is a vessel; the final video is assembled without inflating one huge ArrayBuffer.
*/
self.AwtsVideoBase = self.AwtsVideoBase || {};
AwtsVideoBase.idbVideoDbName = 'BH_VIDEO_RANDOM_ACCESS_TARGET_V1';
AwtsVideoBase.idbOpenVideoDb = function idbOpenVideoDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(AwtsVideoBase.idbVideoDbName, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('writes')) db.createObjectStore('writes', { keyPath: ['sessionId', 'id'] });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};
AwtsVideoBase.idbWithWriteStore = async function idbWithWriteStore(mode, fn) {
    const db = await AwtsVideoBase.idbOpenVideoDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('writes', mode);
        const store = tx.objectStore('writes');
        let result;
        try { result = fn(store); } catch (error) { db.close(); reject(error); return; }
        tx.oncomplete = () => { db.close(); resolve(result); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
};
AwtsVideoBase.idbPutVideoWrite = function idbPutVideoWrite(sessionId, id, position, data) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    return AwtsVideoBase.idbWithWriteStore('readwrite', store => store.put({ sessionId, id, position, size: bytes.byteLength, blob }));
};
AwtsVideoBase.idbGetVideoWrite = function idbGetVideoWrite(sessionId, id) {
    return new Promise(async (resolve, reject) => {
        const db = await AwtsVideoBase.idbOpenVideoDb();
        const tx = db.transaction('writes', 'readonly');
        const req = tx.objectStore('writes').get([sessionId, id]);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
};
AwtsVideoBase.idbClearVideoSession = function idbClearVideoSession(sessionId) {
    return AwtsVideoBase.idbWithWriteStore('readwrite', store => {
        const range = IDBKeyRange.bound([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER]);
        store.delete(range);
    });
};

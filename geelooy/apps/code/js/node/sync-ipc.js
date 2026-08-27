
// B"H
/**
 * @file sync-ipc.js
 * @brief Manages the SharedArrayBuffer I/O stream for synchronous file operations requested by the worker.
 * 
 * THE CHALICE OF SYNCHRONICITY:
 * When the Golem (Node Worker) pauses its reality, it cries out for nourishment 
 * from the physical disk. This file catches that prayer. It performs the 
 * asynchronous heavy lifting, retrieving the data from FileSystemProvider, 
 * and streams it directly into the SharedArrayBuffer memory space, signaling 
 * the worker to wake up and consume the bytes. The Awtsmoos sustains all 
 * layers of existence, from the UI thread to the deepest isolated worker!
 */

import { FileSystemProvider } from '../fs-provider.js';
import { PathResolver } from '../utils/path-resolver.js';

function bytesToBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

async function encodeReadContent(content) {
    if (content instanceof Blob) {
        return "__B64__" + bytesToBase64(new Uint8Array(await content.arrayBuffer()));
    }
    if (content instanceof ArrayBuffer) return "__B64__" + bytesToBase64(new Uint8Array(content));
    if (ArrayBuffer.isView(content)) return "__B64__" + bytesToBase64(new Uint8Array(content.buffer, content.byteOffset, content.byteLength));
    return String(content);
}

function decodeWriteContent(content) {
    const text = String(content ?? "");
    if (!text.startsWith("__B64__")) return text;
    const binary = atob(text.slice(7));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes]);
}

export const SyncIpcHandler = {
    /**
     * B"H
     * Processes a synchronous I/O request from the worker.
     * @param {Object} process - The Node Manager's process record.
     * @param {Object} data - The request data payload.
     */
    async handleOp(process, data) {
        const absPath = PathResolver.resolve('/', data.path);
        const item = { ...process.rootItem, path: absPath, kind: 'file' };

        try {
            let resultString = "";

            if (data.type === 'sync-read') {
                const content = await FileSystemProvider.read(item);
                resultString = await encodeReadContent(content);
            } 
            else if (data.type === 'sync-write') {
                await FileSystemProvider.write(item, decodeWriteContent(data.content));
                resultString = "OK";
            }
            else if (data.type === 'sync-stat') {
                // Determine existence by attempting list or read
                let exists = false;
                try {
                    await FileSystemProvider.read(item);
                    exists = true;
                } catch(e) {
                    try {
                        const dirItem = { ...item, kind: 'directory' };
                        await FileSystemProvider.list(dirItem);
                        exists = true;
                    } catch(e2) {}
                }
                if (!exists) throw new Error("Not Found");
                resultString = "true";
            }
            else if (data.type === 'sync-list') {
                const dirItem = { ...item, kind: 'directory' };
                const res = await FileSystemProvider.list(dirItem);
                const children = Array.isArray(res) ? res : (res.entries || []);
                resultString = JSON.stringify(children.map(c => c.name));
            }

            await this._sendChunks(process, resultString);

        } catch(err) {
            Atomics.store(process.controlView, 4, 1); // Error flag
            Atomics.store(process.controlView, 0, 1); // Unlock
            Atomics.notify(process.controlView, 0);
        }
    },

    /**
     * B"H
     * Pours the resulting string essence into the SharedArrayBuffer in segments.
     * @param {Object} process - The process object.
     * @param {string} strData - The data string to transmit.
     */
    async _sendChunks(process, strData) {
        const bytes = new TextEncoder().encode(strData);
        let offset = 0;
        Atomics.store(process.controlView, 4, 0);
        if (bytes.length === 0) {
            Atomics.store(process.controlView, 1, 0);
            Atomics.store(process.controlView, 2, 1); // isLast
            Atomics.store(process.controlView, 0, 1);
            Atomics.notify(process.controlView, 0);
            return;
        }

        while(offset < bytes.length) {
            const chunk = bytes.subarray(offset, offset + 65536);
            new Uint8Array(process.dataSAB).set(chunk);
            Atomics.store(process.controlView, 1, chunk.length);
            Atomics.store(process.controlView, 2, (offset + chunk.length >= bytes.length) ? 1 : 0);
            Atomics.store(process.controlView, 0, 1);
            Atomics.notify(process.controlView, 0);
            
            await new Promise(r => { process.ack = r; });
            process.ack = null;
            offset += chunk.length;
        }
    }
};

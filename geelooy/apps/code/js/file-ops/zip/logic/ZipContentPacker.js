
// B"H
/**
 * @file ZipContentPacker.js
 * @brief THE PACKER OF THE BINARY SPARKS.
 */

import { FileSystemProvider } from '../../../fs-provider.js';

export const ZipContentPacker = {
    /**
     * @async
     * @function packFile
     * @description Reads file essence and places it in the encoder.
     */
    async packFile(encoder, safeItem, pathInZip) {
        try {
            const raw = await FileSystemProvider.read(safeItem);
            let bytes;
            
            if (raw instanceof Blob) {
                bytes = new Uint8Array(await raw.arrayBuffer());
            } else if (typeof raw === 'string') {
                bytes = new TextEncoder().encode(raw);
            } else if (raw?.base64Content) {
                const text = atob(raw.base64Content);
                bytes = new Uint8Array(text.length);
                for(let i=0; i<text.length; i++) bytes[i] = text.charCodeAt(i);
            } else {
                bytes = new Uint8Array(0);
            }
            
            encoder.addFile(pathInZip, bytes);
            return true;
        } catch (e) {
            console.warn(`[ZipPacker] B"H - File ${pathInZip} dropped from archive:`, e);
            return false;
        }
    }
};

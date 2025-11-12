// B"H
// FILE: js/awtsmoos-handler.js
/**
 * This module integrates the Awtsmoos binary JSON format with the Vivid X editor.
 */

import { parse, binaryToHexView } from '/scripts/awtsmoos/binary/awtsmoos-json-parser.js';
import { serialize } from '/scripts/awtsmoos/binary/awtsmoos-json-serializer.js';

export const AwtsmoosHandler = {
    async decodeContent(binaryContent) {
        const arrayBuffer = await this._getArrayBuffer(binaryContent);
        const parsedObject = parse(arrayBuffer);
        if (parsedObject === null) {
            throw new Error("Parsing failed. File may be corrupt or have an unrecognized magic number.");
        }
        return JSON.stringify(parsedObject, null, '\t');
    },

    async encodeContent(jsonString) {
        let jsonObject;
        try {
            jsonObject = JSON.parse(jsonString);
        } catch (e) {
            throw new Error("Editor does not contain valid JSON. Cannot save.");
        }
        const binaryData = serialize(jsonObject);
        if (binaryData === null) {
            throw new Error("Serialization process failed.");
        }
        return binaryData;
    },
    
    async binaryToHexView(binaryContent) {
        const arrayBuffer = await this._getArrayBuffer(binaryContent);
        return binaryToHexView(arrayBuffer);
    },

    async _getArrayBuffer(content) {
        if (content instanceof ArrayBuffer) return content;
        if (content instanceof Blob) return content.arrayBuffer();
        if (content && content.isBinary && content.base64Content) {
            const binaryString = atob(content.base64Content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
            return bytes.buffer;
        }
        throw new Error("Unsupported content type for conversion.");
    }
};
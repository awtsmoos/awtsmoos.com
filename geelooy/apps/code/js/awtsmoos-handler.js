// B"H
// FILE: js/awtsmoos-handler.js
/**
 * This module integrates the Awtsmoos binary JSON format with the Vivid X editor.
 * It provides core functions for decoding binary content to a string for the editor,
 * and encoding a string from the editor back to binary for saving.
 */

// B"H - We are importing YOUR saved modules from the path you specified.
import { parse } from '/scripts/awtsmoos/binary/awtsmoos-json-parser.js';
import { serialize } from '/scripts/awtsmoos/binary/awtsmoos-json-serializer.js';

export const AwtsmoosHandler = {
    /**
     * Decodes binary content (Blob, ArrayBuffer, etc.) into a pretty-printed JSON string.
     * @param {Blob|ArrayBuffer|{isBinary:boolean, base64Content:string}} binaryContent
     * @returns {Promise<string>} A promise that resolves to the formatted JSON string.
     */
    async decodeContent(binaryContent) {
        let arrayBuffer;
        if (binaryContent instanceof Blob) {
            arrayBuffer = await binaryContent.arrayBuffer();
        } else if (binaryContent instanceof ArrayBuffer) {
            arrayBuffer = binaryContent;
        } else if (binaryContent && binaryContent.isBinary && binaryContent.base64Content) {
            // Handle GitHub's binary file format
            const binaryString = atob(binaryContent.base64Content);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            arrayBuffer = bytes.buffer;
        } else {
            throw new Error("Unsupported content type for decoding.");
        }

        const parsedObject = parse(arrayBuffer);
        if (parsedObject === null) {
            throw new Error("Parsing failed. File may be corrupt.");
        }

        // Return as a pretty-printed string with tabs, as requested.
        return JSON.stringify(parsedObject, null, '\t');
    },

    /**
     * Encodes a JSON string from the editor into a Uint8Array for saving.
     * @param {string} jsonString - The string content from the editor.
     * @returns {Promise<Uint8Array>} A promise that resolves to the binary data.
     */
    async encodeContent(jsonString) {
        let jsonObject;
        try {
            jsonObject = JSON.parse(jsonString);
        } catch (e) {
            throw new Error("Editor does not contain valid JSON. Cannot save.");
        }

        const binaryData = serialize(jsonObject); // Should return a Uint8Array
        if (binaryData === null) {
            throw new Error("Serialization process failed.");
        }
        return binaryData;
    },
    
    /**
     * Converts binary content into a readable string of byte values for "View Binary" mode.
     * @param {Blob|ArrayBuffer|{isBinary:boolean, base64Content:string}} binaryContent
     * @returns {Promise<string>} A promise that resolves to a string of byte values.
     */
    async binaryToString(binaryContent) {
        let arrayBuffer;
        if (binaryContent instanceof Blob) {
            arrayBuffer = await binaryContent.arrayBuffer();
        } else if (binaryContent instanceof ArrayBuffer) {
            arrayBuffer = binaryContent;
        } else if (binaryContent && binaryContent.isBinary && binaryContent.base64Content) {
             const binaryString = atob(binaryContent.base64Content);
             const len = binaryString.length;
             const bytes = new Uint8Array(len);
             for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
             arrayBuffer = bytes.buffer;
        } else {
            return "Could not display binary content.";
        }
        
        const bytes = new Uint8Array(arrayBuffer);
        // Returns a simple space-separated list of the byte values.
        return Array.from(bytes).join(' ');
    }
};
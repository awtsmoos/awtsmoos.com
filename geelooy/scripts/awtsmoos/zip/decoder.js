// B"H
// Awtsmoos Native ZIP Decoder
// Parses ZIP files and extracts data using native browser APIs.

export class ZipReader {
    constructor() {
        this.textDecoder = new TextDecoder();
    }

    /**
     * Loads a Blob/File into memory for parsing.
     * @param {Blob} blob 
     */
    async load(blob) {
        this.buffer = await blob.arrayBuffer();
        this.view = new DataView(this.buffer);
        this.uint8 = new Uint8Array(this.buffer);
    }

    /**
     * Parses the Central Directory to list files.
     * @returns {Array} List of file entries
     */
    getEntries() {
        if (!this.view) throw new Error("Awtsmoos: No file loaded.");

        // 1. Find End of Central Directory (EOCD)
        // Scan backwards from the end of the file for signature 0x06054b50.
        // The EOCD is usually at the very end, but can be preceded by a variable length comment (max 64kb).
        let eocdOffset = -1;
        const maxScan = Math.min(this.view.byteLength, 65536 + 22);
        
        for (let i = this.view.byteLength - 22; i >= this.view.byteLength - maxScan; i--) {
            if (this.view.getUint32(i, true) === 0x06054b50) {
                eocdOffset = i;
                break;
            }
        }

        if (eocdOffset === -1) {
            throw new Error("Awtsmoos Error: Invalid ZIP. EOCD signature not found.");
        }

        // 2. Read EOCD Data
        // Offset 10: Total number of entries in central directory (2 bytes)
        const totalEntries = this.view.getUint16(eocdOffset + 10, true);
        // Offset 16: Offset of start of central directory with respect to starting disk number (4 bytes)
        let cdOffset = this.view.getUint32(eocdOffset + 16, true);

        const entries = [];

        // 3. Iterate Central Directory Headers
        for (let i = 0; i < totalEntries; i++) {
            // Check Signature 0x02014b50
            if (this.view.getUint32(cdOffset, true) !== 0x02014b50) {
                break; // Should not happen in valid zip
            }

            // Parse CD Header
            const method = this.view.getUint16(cdOffset + 10, true); // 0=Store, 8=Deflate
            const compSize = this.view.getUint32(cdOffset + 20, true);
            const uncompSize = this.view.getUint32(cdOffset + 24, true);
            const nameLen = this.view.getUint16(cdOffset + 28, true);
            const extraLen = this.view.getUint16(cdOffset + 30, true);
            const commentLen = this.view.getUint16(cdOffset + 32, true);
            const localHeaderOffset = this.view.getUint32(cdOffset + 42, true);

            // Read Filename
            const nameBytes = this.uint8.subarray(cdOffset + 46, cdOffset + 46 + nameLen);
            const filename = this.textDecoder.decode(nameBytes);

            // Create Entry Object
            entries.push({
                filename,
                method,
                compressedSize: compSize,
                uncompressedSize: uncompSize,
                isDir: filename.endsWith('/'),
                // Lazy extraction method
                getData: () => this.extractData(localHeaderOffset, method, compSize, uncompSize)
            });

            // Move to next CD header
            cdOffset += 46 + nameLen + extraLen + commentLen;
        }

        return entries;
    }

    /**
     * Extracts data for a specific file.
     */
    async extractData(localOffset, method, compSize, uncompSize) {
        // Parse Local File Header (LFH) to find where data starts
        // LFH signature: 0x04034b50 (4 bytes) at localOffset
        // Skip 26 bytes to get name length
        const nameLen = this.view.getUint16(localOffset + 26, true);
        const extraLen = this.view.getUint16(localOffset + 28, true);

        const dataStart = localOffset + 30 + nameLen + extraLen;
        const dataEnd = dataStart + compSize;
        
        // Safety check
        if (dataEnd > this.uint8.length) {
            throw new Error("Awtsmoos Error: Unexpected end of file.");
        }

        const rawData = this.uint8.subarray(dataStart, dataEnd);

        if (method === 0) {
            // STORE - Raw data is the file
            return new Blob([rawData]);
        } else if (method === 8) {
            // DEFLATE - Use Native DecompressionStream
            // Note: ZIP uses 'raw' deflate (no zlib header).
            // 'deflate-raw' is supported in modern Chrome, Firefox, Safari.
            if (typeof DecompressionStream === 'undefined') {
                throw new Error("Browser does not support native decompression.");
            }

            try {
                const stream = new ReadableStream({
                    start(controller) {
                        controller.enqueue(rawData);
                        controller.close();
                    }
                });

                const decompressor = new DecompressionStream("deflate-raw");
                const decompressedStream = stream.pipeThrough(decompressor);
                return await new Response(decompressedStream).blob();
            } catch (e) {
                throw new Error("Decompression failed. Browser might not support 'deflate-raw'.");
            }
        } else {
            throw new Error(`Unsupported compression method ID: ${method}`);
        }
    }
}

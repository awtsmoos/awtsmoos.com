// B"H
// Awtsmoos Native ZIP Encoder
// This module creates a ZIP file structure from scratch without external libraries.
// It relies on the browser's native TextEncoder, Blob, and TypedArrays.

/**
 * Calculates the CRC32 checksum for a given byte array.
 * This ensures the integrity of the data, just as Divine Providence ensures
 * the precise purpose of every detail in existence.
 * @param {Uint8Array} data 
 * @returns {number}
 */
function crc32(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            if ((crc & 1) !== 0) {
                crc = (crc >>> 1) ^ 0xEDB88320;
            } else {
                crc = crc >>> 1;
            }
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Converts a JS Date object to MS-DOS Date and Time format.
 * Used in ZIP headers.
 * @param {Date} date 
 * @returns {{dosDate: number, dosTime: number}}
 */
function getDosDateAndTime(date) {
    let year = date.getFullYear();
    // ZIP format starts at 1980. Clamp to 1980 to avoid negative values.
    if (year < 1980) year = 1980;
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    // DOS Date: bits 0-4=day, 5-8=month, 9-15=year-1980
    const dosDate = ((year - 1980) << 9) | (month << 5) | day;
    
    // DOS Time: bits 0-4=second/2, 5-10=minute, 11-15=hour
    const dosTime = (hour << 11) | (minute << 5) | (second >> 1);

    return { dosDate, dosTime };
}

export class ZipFile {
    constructor() {
        this.files = [];
        this.textEncoder = new TextEncoder();
        console.log("Awtsmoos: ZipFile initialized");
    }

    /**
     * Adds a file to the archive.
     * @param {string} path - The relative path inside the zip (e.g., "folder/hello.txt")
     * @param {string|Uint8Array} content - The file content
     */
    addFile(path, content) {
        // Strip leading slash if present to avoid absolute path issues in zip
        if (path.startsWith('/')) path = path.substring(1);

        let data;
        if (typeof content === 'string') {
            data = this.textEncoder.encode(content);
        } else if (content instanceof Uint8Array) {
            data = content;
        } else {
            throw new Error("Awtsmoos Error: Content must be string or Uint8Array");
        }

        this.files.push({
            path: path,
            data: data,
            isDir: false,
            date: new Date()
        });
    }

    /**
     * Adds a folder to the archive.
     * In ZIP, a folder is just an entry ending in '/' with 0 size.
     * @param {string} path 
     */
    addFolder(path) {
        if (path.startsWith('/')) path = path.substring(1);
        if (!path.endsWith('/')) {
            path += '/';
        }
        this.files.push({
            path: path,
            data: new Uint8Array(0),
            isDir: true,
            date: new Date()
        });
    }

    /**
     * Generates the ZIP binary data.
     * @returns {Blob}
     */
    build() {
        const parts = []; // Will hold all binary chunks
        let offset = 0;   // Track current offset in the file
        const centralDirectory = []; // Metadata for the end

        for (const file of this.files) {
            const nameBytes = this.textEncoder.encode(file.path);
            const { dosDate, dosTime } = getDosDateAndTime(file.date);
            const crc = crc32(file.data);
            const size = file.data.length;

            // --- Local File Header (LFH) ---
            // Signature (4 bytes) 0x04034b50
            const lfh = new Uint8Array(30 + nameBytes.length);
            const view = new DataView(lfh.buffer);

            view.setUint32(0, 0x04034b50, true); // Signature
            view.setUint16(4, 10, true);         // Version needed (1.0)
            view.setUint16(6, 0x0800, true);     // Flags (bit 11 = UTF-8)
            view.setUint16(8, 0, true);          // Compression (0 = Store)
            view.setUint16(10, dosTime, true);   // Mod Time
            view.setUint16(12, dosDate, true);   // Mod Date
            view.setUint32(14, crc, true);       // CRC32
            view.setUint32(18, size, true);      // Compressed Size (Store = same)
            view.setUint32(22, size, true);      // Uncompressed Size
            view.setUint16(26, nameBytes.length, true); // Filename length
            view.setUint16(28, 0, true);         // Extra field length

            // Set Filename
            lfh.set(nameBytes, 30);

            // Add LFH and Data to parts
            parts.push(lfh);
            parts.push(file.data);

            // Record metadata for Central Directory
            centralDirectory.push({
                file,
                nameBytes,
                dosDate,
                dosTime,
                crc,
                size,
                offset // The offset where this LFH started
            });

            // Update offset
            offset += lfh.length + size;
        }

        const cdStartOffset = offset;
        let cdSize = 0;

        // --- Central Directory File Headers (CDFH) ---
        for (const cd of centralDirectory) {
            // CDFH static size is 46 bytes
            const cdfh = new Uint8Array(46 + cd.nameBytes.length);
            const view = new DataView(cdfh.buffer);

            view.setUint32(0, 0x02014b50, true); // Signature
            view.setUint16(4, 0x0014, true);     // Version made by (2.0, DOS) - High byte 0=DOS
            view.setUint16(6, 10, true);         // Version needed
            view.setUint16(8, 0x0800, true);     // Flags (UTF-8)
            view.setUint16(10, 0, true);         // Compression (Store)
            view.setUint16(12, cd.dosTime, true);
            view.setUint16(14, cd.dosDate, true);
            view.setUint32(16, cd.crc, true);
            view.setUint32(20, cd.size, true);   // Compressed
            view.setUint32(24, cd.size, true);   // Uncompressed
            view.setUint16(28, cd.nameBytes.length, true);
            view.setUint16(30, 0, true);         // Extra field length
            view.setUint16(32, 0, true);         // Comment length
            view.setUint16(34, 0, true);         // Disk number start
            view.setUint16(36, 0, true);         // Internal attributes
            
            // External attributes
            // Byte 0: DOS Attr. 0x10 = Directory, 0x20 = Archive
            const extAttr = cd.file.isDir ? 0x10 : 0x20;
            view.setUint32(38, extAttr, true); 

            view.setUint32(42, cd.offset, true); // Offset of LFH

            cdfh.set(cd.nameBytes, 46);

            parts.push(cdfh);
            cdSize += cdfh.length;
        }

        // --- End of Central Directory Record (EOCD) ---
        const eocd = new Uint8Array(22);
        const view = new DataView(eocd.buffer);

        view.setUint32(0, 0x06054b50, true); // Signature
        view.setUint16(4, 0, true);          // Disk number
        view.setUint16(6, 0, true);          // Start disk
        view.setUint16(8, this.files.length, true); // Records on disk
        view.setUint16(10, this.files.length, true); // Total records
        view.setUint32(12, cdSize, true);    // Size of central directory
        view.setUint32(16, cdStartOffset, true); // Offset of central directory
        view.setUint16(20, 0, true);         // Comment length

        parts.push(eocd);

        // B"H - Combine everything into a single Blob
        return new Blob(parts, { type: 'application/zip' });
    }
}

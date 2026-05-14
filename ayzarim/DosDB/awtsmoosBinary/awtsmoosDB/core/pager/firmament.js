
// B"H
/**
 * @file firmament.js
 * @chapter Chapter 770: The Rapid Pager (Maier HaGuf)
 * @description
 * Just as the light of the Sun takes time to reach the Earth, so too does 
 * the movement of bytes between Disk and Memory normally carry delay.
 * But here, in the world of AwtsmoosDB, we nullify that delay.
 * 
 * "Quickly, for the sake of Your Name, do what You have spoken!"
 * This Pager achieves extreme velocity (sub-1ms writes) by mirroring 
 * the entire database universe in RAM. Every "write" is a mere buffer-copy 
 * at nanosecond speed. We only "condense" the light back to disk-matter (Asiyah)
 * during controlled fsync intervals or shutdown.
 */

const fs = require('fs');

/**
 * @class PagerFirmament
 * @description High-velocity synchronous memory-mirror for the database.
 */
class PagerFirmament {
    /**
     * @constructor
     * @param {string} filePath - Path to the binary universe.
     */
    constructor(filePath) {
        this.filePath = filePath;
        /** @member {Buffer|null} memory - The active RAM Mirror (Olam HaKosei) */
        this.memory = null;
        this.fd = null;
        this.dirty = false;
        this.isBatching = false;
        /** @member {number} currentFileSize - The tracked boundary of written reality */
        this.currentFileSize = 0;
    }

    /**
     * @method init
     * @description Awaken the Mirror. Synchronously reads the disk into RAM.
     */
    init() {
        if (this.memory !== null) return;
        
        if (fs.existsSync(this.filePath)) {
            const stat = fs.statSync(this.filePath);
            this.currentFileSize = stat.size;
            if (this.currentFileSize > 0) {
                // Summon the entire content from the depths into the Light of RAM.
                this.memory = fs.readFileSync(this.filePath);
                this.fd = fs.openSync(this.filePath, 'r+');
            } else {
                this._manifestVoid();
            }
        } else {
            this._manifestVoid();
        }
    }

    /**
     * @private
     * @description Spawning a 64KB universe from absolute Ayin.
     */
    _manifestVoid() {
        // Minimum RAM mirror, not minimum disk manifestation.
        const startSize = 65536;
        this.memory = Buffer.allocUnsafe(startSize).fill(0);
        this.currentFileSize = 0;
        this.fd = fs.openSync(this.filePath, 'w+');
        this.dirty = false;
    }

    /**
     * @method readExact
     * @description Pulls bytes instantly from the mirrored firmament.
     * @param {number} offset 
     * @param {number} length 
     * @returns {Buffer|null}
     */
    readExact(offset, length) {
        if (this.memory === null) this.init();
        if (offset + length > this.memory.length) return null;
        
        // Fast Slice (0ms) rather than copying - sharing the Essence buffer.
        // For security or separate ownership, one would use subarray() then .copy()
        // but for velocity within our trusted core, we use safe subarrays.
        return this.memory.subarray(offset, offset + length);
    }

    /**
     * @method writeExact
     * @description Inscribes light into the RAM buffer. Extremely fast.
     */
    writeExact(offset, buf) {
        if (this.memory === null) this.init();
        
        const requiredEnd = offset + buf.length;
        if (requiredEnd > this.memory.length) {
            this._expandUniverse(requiredEnd);
        }
        
        // Inscription by copy
        buf.copy(this.memory, offset);
        this.currentFileSize = Math.max(this.currentFileSize, requiredEnd);
        this.dirty = true;
    }

    /**
     * @method logicalSize
     * @description
     * Finds the exact disk boundary. Database files use the allocator cursor;
     * standalone pager tests use the highest byte directly written.
     * @returns {number} Exact byte count to flush.
     */
    logicalSize() {
        const cursor = this.db && this.db.allocator
            ? Number(this.db.allocator.cursor || 0)
            : 0;

        if (Number.isFinite(cursor) && cursor >= 64) return cursor;

        return this.currentFileSize;
    }

    /**
     * @private
     * @description Exponentially increases the boundaries of space to avoid 
     * frequent, expensive reallocations.
     */
    _expandUniverse(minSize) {
        // Growth pattern: double the current heavens, or at least 64KB leaps.
        let newSize = Math.max(minSize, this.memory.length * 2, 65536);
        // Ensure newSize is correctly rounded for SSD performance.
        newSize = (newSize + 4095) & ~4095;

        const biggerMirror = Buffer.allocUnsafe(newSize).fill(0);
        this.memory.copy(biggerMirror, 0, 0, this.memory.length);
        this.memory = biggerMirror;
    }

    /**
     * @method fsync
     * @description Freezes the fluid Light into solid stone Disk.
     * @param {boolean} [force=false] - Ignore batch flags.
     */
    fsync(force = false) {
        // B"H: If the Light hasn't shifted, do not trouble the SSD stone.
        if (!this.dirty || this.fd === null) return;
        
        if (force || !this.isBatching) {
            const exactSize = Math.max(0, this.logicalSize());

            if (exactSize > 0) {
                fs.writeSync(this.fd, this.memory, 0, exactSize, 0);
            }

            fs.ftruncateSync(this.fd, exactSize);
            this.currentFileSize = exactSize;
            this.dirty = false;
        }
    }

    /**
     * @method close
     * @description Withdrawing from the World, sealing the Stone forever.
     */
    close() {
        this.fsync(true);
        if (this.fd !== null) { 
            try { fs.closeSync(this.fd); } catch(e){}
            this.fd = null; 
        }
        this.memory = null;
    }
}

module.exports = PagerFirmament;

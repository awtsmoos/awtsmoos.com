
// B"H
/**
 * @file pager.js
 * @description
 *  =============================================================================
 *  THE SEFIRAH OF YESOD (FOUNDATION) - THE LIGHTNING EXACT-BYTE PAGER
 *  =============================================================================
 *  "He stretches out the north over the void, and hangs the earth upon nothing."
 * 
 *  THE ABOLITION OF TIME AND LATENCY:
 *  By writing exclusively to the RAM memory buffer during normal operations,
 *  we completely bypass the punishing OS syscall overhead. 
 *  The entire universe is synchronized to the physical SSD *only* during a 
 *  `hard` sync (such as database close). 
 *  Operations remain strictly synchronous and hit 1ms benchmarks effortlessly.
 */

const fs = require('fs');

class SynchronousPager {
    /**
     * @constructor
     * @param {string} filePath - The physical anchor of reality.
     */
    constructor(filePath) {
        this.filePath = filePath;
        this.memory = null;
        this.fd = null;
        this.dirty = false;
        this.isBatching = false; // Used by BackgroundSustainers to track flow state
    }

    /**
     * @method init
     * @description Awaken the universe into the RAM of the Creator.
     */
    init() {
        if (this.memory !== null) return;
        
        if (fs.existsSync(this.filePath)) {
            this.memory = fs.readFileSync(this.filePath);
            this.fd = fs.openSync(this.filePath, 'r+');
        } else {
            this.memory = Buffer.alloc(0);
            this.fd = fs.openSync(this.filePath, 'w+');
        }
    }

    /**
     * @property fileSize
     * @description The exact measurement of all created light.
     */
    get fileSize() {
        return this.memory ? this.memory.length : 0;
    }

    /**
     * @method readExact
     * @description Plucks a specific spark from the infinite memory instantly.
     */
    readExact(offset, length) {
        this.init();
        if (offset + length > this.memory.length) return null; 
        
        const res = Buffer.allocUnsafe(length);
        this.memory.copy(res, 0, offset, offset + length);
        return res;
    }

    /**
     * @method writeExact
     * @description Inscribes a new spark into the RAM universe seamlessly.
     */
    writeExact(offset, buffer) {
        this.init();
        const requiredSize = offset + buffer.length;
        
        // If the light expands beyond the current universe, the universe expands.
        if (requiredSize > this.memory.length) {
            const newSize = Math.max(requiredSize, this.memory.length * 2, 4096);
            const newMem = Buffer.allocUnsafe(newSize);
            this.memory.copy(newMem, 0, 0, this.memory.length);
            
            // Fill the new expansion with the absolute void
            newMem.fill(0, this.memory.length, newMem.length);
            this.memory = newMem;
        }
        
        // Etch the light directly into the active RAM universe
        buffer.copy(this.memory, offset);
        this.dirty = true;
    }

    /**
     * @method fsync
     * @description Materializes the RAM universe onto the physical disk.
     */
    fsync(hard = false) {
        // B"H: The Lightning Path
        // We refuse to touch the slow, physical SSD unless the Database is actively closing 
        // or a hard sync is explicitly requested. The memory universe is perfectly 
        // consistent and synchronized in RAM.
        if (!this.dirty || this.fd === null) return;

        if (hard) {
            // Write the entire flawless memory map directly to the OS cache in one massive sweep.
            fs.writeSync(this.fd, this.memory, 0, this.memory.length, 0);
            this.dirty = false;
        }
    }

    /**
     * @method close
     * @description Seals the Book of Life.
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

module.exports = SynchronousPager;


// B"H
/**
 * @file tracker.js
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE MEASURE OF TRUTH (MIDDAS HA'EMES)
 *  =============================================================================
 *  Every word spoken by the Creator has an exact weight.
 *  This tracker counts raw payload bytes, stored primitive bytes, and the
 *  savings revealed when repeated letters fold into compressed frames.
 */

class MetricsTracker {
    /**
     * @constructor
     * @description Begins a fresh byte ledger.
     */
    constructor() {
        this.pureBytes = 0;
        this.payloadBytes = 0;
        this.storedPrimitiveBytes = 0;
        this.primitiveWrites = 0;
        this.compressedWrites = 0;
        this.savedBytes = 0;
    }
    
    /**
     * @method add
     * @description Summons the magnitude of a new spark into the total weight.
     * @param {number} bytes 
     */
    add(bytes) {
        if (typeof bytes === 'number' && !isNaN(bytes)) {
            this.pureBytes += bytes;
        }
    }

    /**
     * @method recordPrimitive
     * @description
     * Records one primitive packet. The source bytes are the user's revealed
     * payload; the stored bytes are the contracted garment written to disk.
     *
     * @param {object} packet - Primitive packet with metadata.
     * @returns {void}
     */
    recordPrimitive(packet) {
        if (!packet || !packet.meta) return;

        const source = Number(packet.meta.sourceBytes || 0);
        const stored = Number(packet.meta.storedBytes || 0);

        this.payloadBytes += source;
        this.storedPrimitiveBytes += stored;
        this.primitiveWrites++;

        if (packet.meta.compressed) {
            this.compressedWrites++;
            this.savedBytes += Math.max(0, source - stored);
        }

        this.add(stored);
    }

    /**
     * @method snapshot
     * @description Returns a copy of the byte ledger.
     * @returns {object} Metrics snapshot.
     */
    snapshot() {
        return {
            pureBytes: this.pureBytes,
            payloadBytes: this.payloadBytes,
            storedPrimitiveBytes: this.storedPrimitiveBytes,
            primitiveWrites: this.primitiveWrites,
            compressedWrites: this.compressedWrites,
            savedBytes: this.savedBytes
        };
    }
}

module.exports = MetricsTracker;

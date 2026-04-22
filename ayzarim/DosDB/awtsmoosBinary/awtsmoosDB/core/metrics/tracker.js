
// B"H
/**
 * @file tracker.js
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE MEASURE OF TRUTH (MIDDAS HA'EMES)
 *  =============================================================================
 *  Every word spoken by the Creator has an exact weight. 
 *  This tracker counts the pure, abstract bytes before they are clothed 
 *  in the garments of physical blocks and padding.
 */

class MetricsTracker {
    constructor() {
        this.pureBytes = 0;
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
}

module.exports = MetricsTracker;

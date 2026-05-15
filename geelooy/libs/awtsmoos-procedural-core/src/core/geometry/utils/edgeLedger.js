
// B"H
/**
 * @file edgeLedger.js
 * @brief The Divine Accountant of Boundaries.
 * 
 * THE PSALM OF THE LEDGER:
 * Two points make a line, but which lines are the Truth?
 * The Ledger records the boundary, the eternal youth.
 * We hash the min and the max, a key for the pair,
 * Ensuring no duplicate line is drawn in the air.
 * The Diagonal is rejected, the Quad is preserved,
 * Only the outer limits are rightfully served.
 */

export class EdgeLedger {
    constructor() {
        this.edges = new Set();
        this.indices =[];
    }

    /**
     * Records a pure boundary edge.
     * Automatically deduplicates shared walls between adjacent faces.
     */
    add(i1, i2) {
        // Sort to ensure direction independence: (A,B) == (B,A)
        const min = i1 < i2 ? i1 : i2;
        const max = i1 < i2 ? i2 : i1;
        const key = `${min}_${max}`; 

        if (!this.edges.has(key)) {
            this.edges.add(key);
            this.indices.push(i1, i2);
        }
    }

    getWireframeIndices() {
        return this.indices;
    }
    
    getCount() {
        return this.indices.length;
    }
}

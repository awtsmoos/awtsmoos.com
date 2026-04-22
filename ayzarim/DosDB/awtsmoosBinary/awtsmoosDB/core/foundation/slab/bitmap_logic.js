
// B"H
/**
 * @file bitmap_logic.js
 * @description O(1) Bitwise search using CLZ32.
 */
class SlabBitmap {
    constructor(capacity) {
        this.capacity = capacity;
        this.words = new Uint32Array(Math.ceil(capacity / 32));
        this.used = 0;
    }
    isFull() { return this.used >= this.capacity; }
    findAndSet() {
        if (this.isFull()) return -1;
        for (let i = 0; i < this.words.length; i++) {
            if (this.words[i] !== 0xFFFFFFFF) {
                const inv = ~this.words[i];
                const lowest = inv & -inv;
                const bitIndex = 31 - Math.clz32(lowest);
                this.words[i] |= lowest;
                this.used++;
                return (i * 32) + bitIndex;
            }
        }
        return -1;
    }
}
module.exports = SlabBitmap;

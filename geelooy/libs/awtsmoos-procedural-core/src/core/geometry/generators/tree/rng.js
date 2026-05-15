
// B"H
export class TreeRNG {
    constructor(seed) {
        this.seed = seed || 12345;
        this.s = this.seed;
    }

    // Returns float between min and max
    random(min = 0, max = 1) {
        this.s = (this.s * 9301 + 49297) % 233280;
        const val = this.s / 233280;
        return min + val * (max - min);
    }
}

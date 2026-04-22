
// B"H
const SlabArena = require('./arena_vessel.js');
const constants = require('../../../constants.js');

class SlabManager {
    constructor(v1) {
        this.v1 = v1;
        this.db = v1.db;
        this.arenas = { 16: [], 32: [], 64: [], 128: [] };
    }
    allocate(size) {
        let tier = 16;
        if (size > 16) tier = 32;
        if (size > 32) tier = 64;
        if (size > 64) tier = 128;
        if (size > 128) return null;

        const list = this.arenas[tier];
        let arena = list.find(a => !a.bitmap.isFull());
        if (!arena) {
            const ptr = this.v1.allocate(constants.BLOCK_SIZE);
            arena = new SlabArena(this.db, ptr, tier);
            list.push(arena);
        }
        return arena.claim();
    }
    flush() {
        for (const tier in this.arenas) {
            for (const arena of this.arenas[tier]) arena.flush();
        }
    }
}
module.exports = SlabManager;

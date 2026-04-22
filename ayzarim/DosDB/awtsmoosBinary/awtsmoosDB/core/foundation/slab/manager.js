
// B"H
/**
 * @file manager.js
 * @description Orchestrates micro-slot allocation across multiple 4KB Arenas.
 */
const SlabArena = require('./arena.js');
const constants = require('../../../constants.js');

class SlabManager {
    constructor(v1) {
        this.v1 = v1;
        this.db = v1.db;
        this.tiers = { 16: [], 32: [], 64: [], 128: [] };
        this.activeArenas = new Map();
    }

    allocate(size) {
        let tier = 16;
        if (size > 16) tier = 32;
        if (size > 32) tier = 64;
        if (size > 64) tier = 128;
        if (size > 128) return null;

        const list = this.tiers[tier];
        let arena = list.find(a => !a.bitmap.isFull());
        
        if (!arena) {
            const ptr = this.v1.allocate(constants.BLOCK_SIZE);
            arena = new SlabArena(this.db, ptr, tier);
            list.push(arena);
            this.activeArenas.set(ptr.blockId, arena);
        }

        return arena.claim();
    }

    getArena(blockId) {
        return this.activeArenas.get(blockId);
    }

    /**
     * @method flush
     * @description Flushes all dirty Arenas to the disk.
     */
    flush() {
        for (const arena of this.activeArenas.values()) {
            arena.flush();
        }
    }
}

module.exports = SlabManager;

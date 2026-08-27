
// B"H
/**
 * @file index.js
 * @description
 *  =============================================================================
 *  CHAPTER 9: THE MASTER OF THE SPARKS
 *  =============================================================================
 *  The centralized Primitive Saver. Passes the state context through the pure router.
 */

const SlabManager = require('../../allocator/slab/index.js');
const PrimitiveRouter = require('./router/index.js');

class PrimitiveSaver {
    constructor(allocator) {
        this.allocator = allocator;
        this.v1 = allocator.v1;
        this.db = allocator.db;
        this.heap = allocator.heap;
        this.slab = new SlabManager(this.v1);
    }

    save(val) {
        // Pass 'this' as the universal context to the stateless router
        return PrimitiveRouter.route(val, this);
    }
}

module.exports = PrimitiveSaver;

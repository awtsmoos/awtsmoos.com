
// B"H
/**
 * @file index.js (Sequence Manifestor)
 * @chapter The House of Tiferet (Harmony)
 */

const Sequence = require('../../../../../../structure/sequence/index.js');

class SequenceManifestor {
    static manifest(builder, val, visited) {
        const s = new Sequence(builder.allocator);
        s.create();
        
        const items = Array.isArray(val) ? val :[];
        
        for (const item of items) {
            const itemSeal = builder.build(item, visited);
            s.push(itemSeal, { isPtr: true });
        }
        
        return s.seal();
    }
}

module.exports = SequenceManifestor;

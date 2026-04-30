
// B"H
/**
 * @file index.js (Dict Manifestor)
 * @chapter The House of Bina (Understanding)
 */

const Dictionary = require('../../../../../../structure/dictionary/index.js');

class DictManifestor {
    static manifest(builder, val, visited) {
        const d = new Dictionary(builder.allocator);
        d.create();
        
        for (const k of Object.keys(val)) {
            if (k.startsWith('_isAwtsmoos')) continue;
            
            const valSeal = builder.build(val[k], visited);
            d.set(k, valSeal, { isPtr: true });
        }
        
        return d.seal();
    }
}

module.exports = DictManifestor;

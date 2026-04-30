
// B"H
/**
 * @file index.js (Map Manifestor)
 * @chapter The House of Gevurah (Severity/Ordering)
 */

const MapEngine = require('../../../../../../structure/map/index.js');
const SmartPointer = require('../../../../../../utils/smartPointer/index.js');

class MapManifestor {
    static manifest(builder, val, visited) {
        const m = new MapEngine(builder.allocator);
        m.create();
        
        for (const k of Object.keys(val)) {
            if (k.startsWith('_isAwtsmoos')) continue;
            const valSeal = builder.build(val[k], visited);
            m.set(k, valSeal);
        }
        
        return SmartPointer.toBuffer(m.ptr);
    }
}

module.exports = MapManifestor;

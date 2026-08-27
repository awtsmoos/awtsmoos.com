
// B"H
/**
 * @file core/type/instance.js
 * @description Instance Saver.
 */
const constants = require('../../constants.js');
const serializer = require('../../utils/serializer.js');
const SmartPointer = require('../../utils/smartPointer/index.js');

class CustomInstanceSaver {
    constructor(allocator) {
        this.allocator = allocator;
        this.v1 = allocator.v1;
        this.db = allocator.db;
        this.builder = allocator.builder;
    }

    save(obj, visited) {
        const T = constants.VAL_TYPE;
        const name = obj.constructor.name;
        const source = obj.constructor.toString();
        const nameBuf = Buffer.from(name, 'utf8');
        const sourceBuf = Buffer.from(source, 'utf8');
        
        const props = {};
        for (const k of Object.keys(obj)) props[k] = obj[k];
        const dictSeal = this.builder.build(props, visited);
        
        const dictSealVarIntSize = serializer.getVarIntSize(dictSeal.length);
        const totalLenHeader = serializer.getVarIntSize(nameBuf.length) + nameBuf.length + 
                               serializer.getVarIntSize(sourceBuf.length) + sourceBuf.length + 
                               dictSealVarIntSize + dictSeal.length; 
        
        const p = this.v1.allocate(totalLenHeader);
        const seal = SmartPointer.encode(T.CUSTOM_INSTANCE, p.offset, totalLenHeader);
        
        // B"H: The Tikkun of Circular Instances. Store the pointer properly.
        visited.set(obj, { building: false, vessel: { ptr: SmartPointer.decode(seal) } });
        
        const buf = Buffer.allocUnsafe(totalLenHeader);
        let off = 0;
        off += serializer.writeVarIntTo(buf, off, nameBuf.length);
        nameBuf.copy(buf, off); off += nameBuf.length;
        off += serializer.writeVarIntTo(buf, off, sourceBuf.length);
        sourceBuf.copy(buf, off); off += sourceBuf.length;
        
        off += serializer.writeVarIntTo(buf, off, dictSeal.length);
        dictSeal.copy(buf, off); 
        this.db._writeChainSafe(p, buf);
        
        return seal;
    }
}
module.exports = CustomInstanceSaver;


// B"H
const constants = require('../../constants.js');
const serializer = require('../../utils/serializer.js');
const SmartPointer = require('../../utils/smartPointer.js');

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
        const nameVarIntSize = serializer.getVarIntSize(nameBuf.length);
        const sourceVarIntSize = serializer.getVarIntSize(sourceBuf.length);
        
        const props = {};
        for (const k of Object.keys(obj)) props[k] = obj[k];
        const dictSeal = this.builder.build(props, visited);
        
        const dictSealVarIntSize = serializer.getVarIntSize(dictSeal.length);
        const totalLenHeader = nameVarIntSize + nameBuf.length + sourceVarIntSize + sourceBuf.length + dictSealVarIntSize + dictSeal.length; 
        
        const p = this.v1.allocate(totalLenHeader);
        const seal = SmartPointer.block(T.CUSTOM_INSTANCE, p.blockId, totalLenHeader, !!p.isChain, p.offset);
        visited.set(obj, seal);
        
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

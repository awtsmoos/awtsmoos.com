
// B"H
class GGUFParser {
    constructor() {
        this.GGUF_MAGIC = 'GGUF';
    }

    parse(buffer) {
        const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        let offset = 0;
        const decoder = new TextDecoder('utf-8');
        let vocab = [];
        let scores = [];
        let kv = {}; 
        let alignment = 32; 

        const magic = String.fromCharCode(...new Uint8Array(buffer.buffer, buffer.byteOffset + offset, 4));
        offset += 4;
        
        if (magic !== this.GGUF_MAGIC) throw new Error(`Invalid Magic: '${magic}'`);

        const version = view.getUint32(offset, true); offset += 4;
        const tensorCount = view.getBigUint64(offset, true); offset += 8;
        const kvCount = view.getBigUint64(offset, true); offset += 8;

        const count = Number(kvCount);
        for (let i = 0; i < count; i++) {
            const kLen = Number(view.getBigUint64(offset, true)); offset += 8;
            const kBytes = new Uint8Array(buffer.buffer, buffer.byteOffset + offset, kLen);
            const key = decoder.decode(kBytes); offset += kLen;

            const type = view.getUint32(offset, true); offset += 4;
            const result = this.readValue(view, offset, type, decoder, buffer);
            offset = result.newOffset;
            
            kv[key] = result.value;

            if (key === 'tokenizer.ggml.tokens') vocab = result.value;
            else if (key === 'tokenizer.ggml.scores') scores = result.value;
            else if (key === 'general.alignment') alignment = Number(result.value);
        }

        const tensorMap = new Map();
        const tCount = Number(tensorCount);
        
        for (let i = 0; i < tCount; i++) {
            const nLen = Number(view.getBigUint64(offset, true)); offset += 8;
            const nBytes = new Uint8Array(buffer.buffer, buffer.byteOffset + offset, nLen);
            const name = decoder.decode(nBytes); offset += nLen;

            const nDims = view.getUint32(offset, true); offset += 4;
            const dims = [];
            for (let d = 0; d < nDims; d++) { 
                dims.push(Number(view.getBigUint64(offset, true))); offset += 8; 
            }
            
            const type = view.getUint32(offset, true); offset += 4;
            const dataOffset = Number(view.getBigUint64(offset, true)); offset += 8;
            
            tensorMap.set(name, { name, dims, type, dataOffset });
        }

        const padding = (offset % alignment === 0) ? 0 : (alignment - (offset % alignment));
        const dataBase = offset + padding;

        return { vocab, scores, kv, tensorMap, dataOffset: dataBase, buffer };
    }

    readValue(view, offset, type, decoder, nodeBuf) {
        let value;
        switch (type) {
            case 0: value = view.getUint8(offset); offset += 1; break;
            case 1: value = view.getInt8(offset); offset += 1; break;
            case 2: value = view.getUint16(offset, true); offset += 2; break;
            case 3: value = view.getInt16(offset, true); offset += 2; break;
            case 4: value = view.getUint32(offset, true); offset += 4; break;
            case 5: value = view.getInt32(offset, true); offset += 4; break;
            case 6: value = view.getFloat32(offset, true); offset += 4; break;
            case 7: value = !!view.getUint8(offset); offset += 1; break;
            case 8:
                const sLen = Number(view.getBigUint64(offset, true)); offset += 8;
                const sBytes = new Uint8Array(nodeBuf.buffer, nodeBuf.byteOffset + offset, sLen);
                value = decoder.decode(sBytes); offset += sLen;
                break;
            case 9:
                const aType = view.getUint32(offset, true); offset += 4;
                const aLen = Number(view.getBigUint64(offset, true)); offset += 8;
                value = new Array(aLen);
                for (let k = 0; k < aLen; k++) {
                    const res = this.readValue(view, offset, aType, decoder, nodeBuf);
                    value[k] = res.value; offset = res.newOffset;
                }
                break;
            case 10: value = view.getBigUint64(offset, true); offset += 8; break;
            case 11: value = view.getBigInt64(offset, true); offset += 8; break;
            case 12: value = view.getFloat64(offset, true); offset += 8; break;
            default: throw new Error(`Unknown type ID: ${type} at ${offset}`);
        }
        return { value, newOffset: offset };
    }
}

module.exports = new GGUFParser();

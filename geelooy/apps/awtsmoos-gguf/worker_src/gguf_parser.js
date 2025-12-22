

// B"H
export const GGUFParserSource = () => {
    
    const GGUF_MAGIC = 'GGUF';
    
    self.parseGGUF = function(buffer) {
        const view = new DataView(buffer);
        let offset = 0;
        const decoder = new TextDecoder('utf-8');
        let vocab = [];
        let scores = [];
        let kv = {}; 
        let alignment = 32; 

        self.logDB("--- PARSING GGUF (Worker) ---", 'accent');

        // 1. Magic
        if (buffer.byteLength < 4) throw new Error("File too short");
        const magic = String.fromCharCode(...new Uint8Array(buffer, offset, 4));
        offset += 4;
        
        if (magic !== GGUF_MAGIC) {
            if (magic.startsWith('<!D') || magic.startsWith('<ht') || magic.startsWith(' <!') || magic.startsWith('{')) {
                throw new Error("Invalid File: It looks like you uploaded a text/HTML file. Please load a valid .gguf model file.");
            }
            throw new Error(`Invalid Magic: '${magic}' (Expected 'GGUF'). Use a .gguf file.`);
        }

        // 2. Header
        const version = view.getUint32(offset, true); offset += 4;
        const tensorCount = view.getBigUint64(offset, true); offset += 8;
        const kvCount = view.getBigUint64(offset, true); offset += 8;

        self.logDB(`Version: ${version} | Tensors: ${tensorCount} | KV Pairs: ${kvCount}`, 'info');

        // 3. Metadata
        const count = Number(kvCount);
        
        for (let i = 0; i < count; i++) {
            const kLen = Number(view.getBigUint64(offset, true)); offset += 8;
            const key = decoder.decode(new Uint8Array(buffer, offset, kLen)); offset += kLen;

            const type = view.getUint32(offset, true); offset += 4;
            const result = self.readValue(view, offset, type, decoder, buffer);
            offset = result.newOffset;
            
            kv[key] = result.value;

            if (key === 'tokenizer.ggml.tokens') {
                vocab = result.value;
                self.logDB(`[KV] Vocabulary Loaded: ${vocab.length} tokens`, 'info');
            } else if (key === 'tokenizer.ggml.scores') {
                scores = result.value;
            } else if (key === 'general.alignment') {
                alignment = Number(result.value);
            } else if (key === 'tokenizer.ggml.add_space_prefix') {
                self.logDB(`[KV] tokenizer.ggml.add_space_prefix: ${result.value}`, 'warn');
            } else {
                // Safe Logging
                let logVal = result.value;
                if (Array.isArray(logVal)) {
                    logVal = `[Array(${logVal.length})]`;
                } else if (typeof logVal === 'string' && logVal.length > 100) {
                    logVal = logVal.substring(0, 100) + '... (truncated)';
                }
                // self.logDB(`[KV] ${key}: ${logVal}`, 'debug');
            }
        }

        return {
            vocab: vocab,
            scores: scores,
            kv: kv,
            endOffset: offset,
            tensorCount: Number(tensorCount),
            alignment: alignment
        };
    };

    self.readValue = function(view, offset, type, decoder, buffer) {
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
            case 8: // String
                const sLen = Number(view.getBigUint64(offset, true)); offset += 8;
                value = decoder.decode(new Uint8Array(buffer, offset, sLen)); offset += sLen;
                break;
            case 9: // Array
                const aType = view.getUint32(offset, true); offset += 4;
                const aLen = Number(view.getBigUint64(offset, true)); offset += 8;
                if (aType >= 0 && aType <= 7) { 
                    value = new Array(aLen);
                    for (let k = 0; k < aLen; k++) {
                        const res = self.readValue(view, offset, aType, decoder, buffer);
                        value[k] = res.value;
                        offset = res.newOffset;
                    }
                } else {
                    value = new Array(aLen);
                    for (let k = 0; k < aLen; k++) {
                        const res = self.readValue(view, offset, aType, decoder, buffer);
                        value[k] = res.value;
                        offset = res.newOffset;
                    }
                }
                break;
            case 10: value = view.getBigUint64(offset, true); offset += 8; break;
            case 11: value = view.getBigInt64(offset, true); offset += 8; break;
            case 12: value = view.getFloat64(offset, true); offset += 8; break;
            default: throw new Error(`Unknown type ID: ${type} at ${offset}`);
        }
        return { value, newOffset: offset };
    };
};
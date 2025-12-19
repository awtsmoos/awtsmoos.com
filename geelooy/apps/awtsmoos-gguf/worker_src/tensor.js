// B"H
export const TensorSource = () => {
    
    self.readTensor = function(info, sliceStart = 0, sliceLength = null) {
        if (!info) return null;
        
        // 1. Calculate Expected Dimensions
        const numElements = info.dims.reduce((a, b) => a * b, 1);
        const readLen = sliceLength !== null ? sliceLength : numElements;
        const type = info.type;
        
        // 2. Initialize Output Buffer (Always F32 for computation)
        const finalOutput = new Float32Array(readLen);

        const buffer = self.env.buffer;
        const baseOffset = self.env.dataOffset;
        
        const { blockElements, blockSize } = self.getByteSize(type);

        // 3. Calculate Block Alignment
        const blockIndexStart = Math.floor(sliceStart / blockElements);
        const blockIndexEnd = Math.ceil((sliceStart + readLen) / blockElements);
        const totalBlocks = blockIndexEnd - blockIndexStart;
        
        // 4. Calculate File Offsets
        const byteStart = baseOffset + info.dataOffset + (blockIndexStart * blockSize);
        const byteLength = totalBlocks * blockSize;
        
        // 5. Safe Read Strategy
        let rawBytes = null;
        if (byteStart >= buffer.byteLength) {
            self.logDB(`[TENSOR] OOB: ${info.name} starts at ${byteStart} > EOF. Returning Zeros.`, 'warn');
            return finalOutput;
        }

        let safeByteLength = byteLength;
        if (byteStart + byteLength > buffer.byteLength) {
             self.logDB(`[TENSOR] TRUNCATED: ${info.name}. Wanted ${byteLength} bytes, clipped to available.`, 'warn');
             safeByteLength = buffer.byteLength - byteStart;
        }

        try {
            rawBytes = new Uint8Array(buffer, byteStart, safeByteLength);
        } catch (e) {
            self.logDB(`[TENSOR] VIEW ERROR: ${info.name} - ${e.message}. Allocating zeros.`, 'error');
            return finalOutput;
        }

        // 6. Dequantize
        const totalElementsExpanded = totalBlocks * blockElements;
        let safeRawBytes = rawBytes;
        if (rawBytes.byteLength < byteLength) {
             safeRawBytes = new Uint8Array(byteLength); // Zero filled
             safeRawBytes.set(rawBytes);
        }

        const fullBlockResult = self.dequantize ? self.dequantize(safeRawBytes, type, totalElementsExpanded) : new Float32Array(totalElementsExpanded);

        // 7. Extract the exact requested slice
        const relativeStart = sliceStart - (blockIndexStart * blockElements);
        const copyLen = Math.min(finalOutput.length, fullBlockResult.length - relativeStart);
        if (copyLen > 0) {
            finalOutput.set(fullBlockResult.subarray(relativeStart, relativeStart + copyLen));
        }
        
        return finalOutput;
    };

    self.getRawTensorView = function(info) {
        if (!info) return null;
        const buffer = self.env.buffer;
        const baseOffset = self.env.dataOffset;
        
        const { blockElements, blockSize } = self.getByteSize(info.type);
        
        const numElements = info.dims.reduce((a, b) => a * b, 1);
        const totalBlocks = Math.ceil(numElements / blockElements);
        const byteLength = totalBlocks * blockSize;
        const byteStart = baseOffset + info.dataOffset;
        
        if (byteStart >= buffer.byteLength) {
             self.logDB(`[PURIFY] OOB: ${info.name} entirely OOB. Returning empty vessel.`, 'warn');
             return new Uint8Array(byteLength);
        }
        
        if (byteStart + byteLength > buffer.byteLength) {
             self.logDB(`[PURIFY] TRUNCATED: ${info.name}. Padding with zeros.`, 'warn');
             const safeLen = buffer.byteLength - byteStart;
             const out = new Uint8Array(byteLength);
             const src = new Uint8Array(buffer, byteStart, safeLen);
             out.set(src);
             return out;
        }

        return new Uint8Array(buffer, byteStart, byteLength);
    };

    self.scanTensors = function(buffer, startOffset, count, alignment = 32) {
        const view = new DataView(buffer);
        let offset = startOffset;
        const decoder = new TextDecoder('utf-8');
        self.env.tensorMap.clear();
        
        for (let i = 0; i < count; i++) {
            const nLen = Number(view.getBigUint64(offset, true)); offset += 8;
            const name = decoder.decode(new Uint8Array(buffer, offset, nLen)); offset += nLen;
            const nDims = view.getUint32(offset, true); offset += 4;
            const dims = [];
            for (let d = 0; d < nDims; d++) { dims.push(Number(view.getBigUint64(offset, true))); offset += 8; }
            const type = view.getUint32(offset, true); offset += 4;
            const dataOffset = Number(view.getBigUint64(offset, true)); offset += 8;
            
            self.env.tensorMap.set(name, { name, dims, type, dataOffset });
        }
        
        const finalOffset = (offset + alignment - 1) & ~(alignment - 1);
        self.logDB(`[ALIGNMENT] Header End: ${offset} | Aligned Data Start: ${finalOffset}`, 'info');
        return finalOffset;
    };
    
    // B"H - THE SACRED AND COMPLETE BLUEPRINT OF QUANTIZATION
    self.getByteSize = function(type) {
        // blockElements: how many numbers in a block
        // blockSize: how many bytes a block takes
        switch (type) {
            case 0:  return { blockElements: 1, blockSize: 4 };    // F32
            case 1:  return { blockElements: 1, blockSize: 2 };    // F16
            case 2:  return { blockElements: 32, blockSize: 18 };   // Q4_0
            case 3:  return { blockElements: 32, blockSize: 20 };   // Q4_1
            case 6:  return { blockElements: 32, blockSize: 18 };   // Q5_0
            case 7:  return { blockElements: 32, blockSize: 20 };   // Q5_1
            case 8:  return { blockElements: 32, blockSize: 34 };   // Q8_0
            case 9:  return { blockElements: 32, blockSize: 40 };   // Q8_1
            case 10: return { blockElements: 256, blockSize: 110 }; // Q2_K
            case 11: return { blockElements: 256, blockSize: 120 }; // Q3_K
            case 12: return { blockElements: 256, blockSize: 144 }; // Q4_K
            case 13: return { blockElements: 256, blockSize: 176 }; // Q5_K
            case 14: return { blockElements: 256, blockSize: 210 }; // Q6_K
            case 15: return { blockElements: 256, blockSize: 264 }; // Q8_K
            case 16: return { blockElements: 256, blockSize: 96 };  // IQ2_XXS
            case 17: return { blockElements: 256, blockSize: 112 }; // IQ2_XS
            case 18: return { blockElements: 256, blockSize: 128 }; // IQ3_XXS
            case 19: return { blockElements: 256, blockSize: 80 };  // IQ1_S
            case 20: return { blockElements: 32, blockSize: 18 };   // IQ4_NL
            case 21: return { blockElements: 256, blockSize: 132 }; // IQ3_S
            case 22: return { blockElements: 256, blockSize: 128 }; // IQ2_S
            case 23: return { blockElements: 256, blockSize: 160 }; // IQ4_XS
            default: 
                self.logDB(`[getByteSize] Unknown type ${type}, falling back to F32`, 'error');
                return { blockElements: 1, blockSize: 4 };
        }
    };
};
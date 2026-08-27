// B"H
/**
 * Tensor Scanner Module
 */
export const tensorMap = new Map();

// Removed DOM dependency (logEngine) so this can run in Worker if needed, 
// though parsing happens in main. We will pass result to worker.
// Actually, tensor scan happens in loader which is now in worker.
// So we need to ensure this doesn't import UI loggers.

export function scanTensors(buffer, startOffset, count, alignment = 32) {
    const view = new DataView(buffer);
    let offset = startOffset;
    const decoder = new TextDecoder('utf-8');
    
    tensorMap.clear();

    for (let i = 0; i < count; i++) {
        // Name
        const nLen = Number(view.getBigUint64(offset, true)); offset += 8;
        const name = decoder.decode(new Uint8Array(buffer, offset, nLen)); offset += nLen;

        // Dimensions
        const nDims = view.getUint32(offset, true); offset += 4;
        const dims = [];
        for (let d = 0; d < nDims; d++) {
            dims.push(Number(view.getBigUint64(offset, true))); offset += 8;
        }

        // Type
        const type = view.getUint32(offset, true); offset += 4;

        // Offset (Relative to Data Base)
        const dataOffset = Number(view.getBigUint64(offset, true)); offset += 8;

        const info = { name, dims, type, dataOffset };
        tensorMap.set(name, info);
    }
    
    // Calculate Data Base Offset
    // The data block starts at the next multiple of 'alignment' after the tensor info block
    // Tensor info block ends at 'offset'
    
    const remainder = offset % alignment;
    const padding = remainder === 0 ? 0 : (alignment - remainder);
    const baseOffset = offset + padding;
    
    return baseOffset;
}

export function getTensorInfo(name) {
    return tensorMap.get(name);
}
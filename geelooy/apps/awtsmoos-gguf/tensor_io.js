// B"H
/**
 * Tensor I/O
 * Reads raw bytes from the Memory Buffer.
 */
import { dequantize } from './tensor_quant.js';
import { getByteSize } from './tensor_utils.js';

/**
 * Reads a tensor (or a slice) from the buffer.
 * Sync operation now since we have the full buffer.
 */
export function readTensor(buffer, baseOffset, info, sliceStart = 0, sliceLength = null) {
    if (!info) return null;

    const numElements = info.dims.reduce((a, b) => a * b, 1);
    const readLen = sliceLength !== null ? sliceLength : numElements;
    
    // Type info
    const type = info.type;
    const { blockElements, blockSize } = getByteSize(type);
    
    // Alignment calc
    const blockIndexStart = Math.floor(sliceStart / blockElements);
    const blockIndexEnd = Math.ceil((sliceStart + readLen) / blockElements);
    const totalBlocks = blockIndexEnd - blockIndexStart;
    
    const byteStart = baseOffset + info.dataOffset + (blockIndexStart * blockSize);
    const byteLength = totalBlocks * blockSize;
    
    // Bounds check
    if (byteStart + byteLength > buffer.byteLength) {
        throw new Error(`Read OOB: ${info.name} ends at ${byteStart + byteLength}, buf is ${buffer.byteLength}`);
    }

    // Create View directly on the buffer (No Copy if possible, but dequant needs DataView)
    // We slice to ensure we don't pass the whole massive buffer to DataView if not needed,
    // although DataView takes offset. Let's use offset for zero-copy.
    const view = new DataView(buffer, byteStart, byteLength);

    // Dequantize
    const fullResult = dequantize(view, type, totalBlocks * blockElements);
    
    // Sub-slice exact elements
    const relativeStart = sliceStart - (blockIndexStart * blockElements);
    
    if (relativeStart === 0 && readLen === fullResult.length) return fullResult;
    return fullResult.subarray(relativeStart, relativeStart + readLen);
}
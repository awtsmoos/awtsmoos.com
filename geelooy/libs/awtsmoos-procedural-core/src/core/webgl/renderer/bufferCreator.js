
// B"H
/**
 * @file bufferCreator.js
 * @brief Allocates and populates GPU memory safely with hardware-aware fallbacks.
 * 
 * THE HYMN OF THE COMPATIBLE SPARK:
 * Not every lamp has the power to hold the brightest light,
 * We must measure the vessel before we ignite the night!
 * If the "Int" is too great for the hardware to bear,
 * We return to the "Short" and find safety there.
 * The Golem is manifested in every degree,
 * From the humble device to the high-end decree!
 */

/**
 * @function createBuffer
 * @description Low-level helper to bind and fill a GL buffer.
 */
function createBuffer(gl, target, data, usage) {
    const buffer = gl.createBuffer();
    if (!buffer) return null;
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, usage);
    return buffer;
}

/**
 * @function setupObjectBuffers
 * @description Prepares WebGL buffers for a mesh, handling hardware limitations for indices.
 */
export function setupObjectBuffers(gl, meshData, objectId, instanceData = null, isDynamic = false) {
    let { positions, colors, normals, indices, wireframeIndices, boneIndices, boneWeights } = meshData;

    // 1. THE TIKKUN OF THE EMPTY VESSEL:
    // Ensure we never pass empty data to the GPU.
    if (!positions || positions.length === 0) {
        positions = [0,0,0, 0,0,0, 0,0,0];
        colors = [1,1,1,1, 1,1,1,1, 1,1,1,1];
        normals = [0,1,0, 0,1,0, 0,1,0];
        indices = [0,1,2];
        wireframeIndices = [0,1, 1,2, 2,0];
    }

    const usage = isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
    const vertCount = positions.length / 3;
    
    // 2. THE TIKKUN OF THE HARDWARE LIMIT:
    // Check for 32-bit index support (OES_element_index_uint extension).
    const extUint = gl.getExtension('OES_element_index_uint');
    const needs32Bit = vertCount > 65535 || (objectId && objectId.includes('ocean'));
    
    const use32Bit = needs32Bit && extUint;
    const IndexArrayType = use32Bit ? Uint32Array : Uint16Array;
    
    if (needs32Bit && !extUint) {
        console.warn(`B"H - [BufferCreator]: Object [${objectId}] requires 32-bit indices but hardware lacks extension. Manifestation may be incomplete.`);
    }

    const pb = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(positions), usage);
    const cb = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(colors), usage);
    const nb = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(normals), usage);
    const ib = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new IndexArrayType(indices), usage);
    
    let wb = null;
    let wireCount = 0;
    
    if (wireframeIndices && wireframeIndices.length > 0) {
        wb = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new IndexArrayType(wireframeIndices), gl.STATIC_DRAW);
        wireCount = wireframeIndices.length;
    } 

    const result = { 
        position: pb, 
        color: cb, 
        normal: nb, 
        indices: ib, 
        wireframeIndices: wb, 
        wireframeIndicesCount: wireCount,
        isDynamic: isDynamic, 
        indexType: use32Bit ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT
    };

    // 3. Skeletal Bindings
    if (boneIndices && boneWeights && boneIndices.length > 0) {
        result.boneIndices = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(boneIndices), usage);
        result.boneWeights = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(boneWeights), usage);
    }

    // 4. Instance Data (Vegetation)
    if (instanceData) {
        if (instanceData.offsets) result.instanceOffset = createBuffer(gl, gl.ARRAY_BUFFER, instanceData.offsets, gl.STATIC_DRAW);
        if (instanceData.scales) result.instanceScale = createBuffer(gl, gl.ARRAY_BUFFER, instanceData.scales, gl.STATIC_DRAW);
        if (instanceData.rotations) result.instanceRotation = createBuffer(gl, gl.ARRAY_BUFFER, instanceData.rotations, gl.STATIC_DRAW);
        if (instanceData.normals) result.instanceNormal = createBuffer(gl, gl.ARRAY_BUFFER, instanceData.normals, gl.STATIC_DRAW);
        if (instanceData.randoms) result.instanceRandom = createBuffer(gl, gl.ARRAY_BUFFER, instanceData.randoms, gl.STATIC_DRAW);
        result.instanceCount = instanceData.count;
    }

    return result;
}

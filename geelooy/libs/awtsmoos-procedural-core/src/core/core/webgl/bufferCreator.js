
// B"H
/**
 * @file bufferCreator.js
 * @brief Allocates and populates GPU memory safely.
 */

function createBuffer(gl, target, data, usage) {
    const buffer = gl.createBuffer();
    if (!buffer) return null;
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, usage);
    return buffer;
}

export function setupObjectBuffers(gl, meshData, objectId, instanceData = null, isDynamic = false) {
    let { positions, colors, normals, indices, wireframeIndices, boneIndices, boneWeights } = meshData;

    // B"H - THE TIKKUN OF THE EMPTY VESSEL:
    // If a procedural object (like a cloud) has not yet generated its vertices, 
    // we do not return null and throw errors. We supply a microscopic, invisible
    // triangle so the WebGL draw state remains unbroken and warnings are silenced.
    if (!positions || positions.length === 0) {
        positions =[0,0,0, 0,0,0, 0,0,0];
        colors =[0,0,0,0, 0,0,0,0, 0,0,0,0];
        normals =[0,1,0, 0,1,0, 0,1,0];
        indices = [0,1,2];
        wireframeIndices = [0,1, 1,2, 2,0];
    }

    const usage = isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
    const vertCount = positions.length / 3;
    
    const use32Bit = vertCount > 65535 && gl.getExtension('OES_element_index_uint');
    const IndexArrayType = use32Bit ? Uint32Array : Uint16Array;

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
        position: pb, color: cb, normal: nb, indices: ib, 
        wireframeIndices: wb, wireframeIndicesCount: wireCount,
        isDynamic: isDynamic, indexType: use32Bit ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT
    };

    if (boneIndices && boneWeights && boneIndices.length > 0) {
        result.boneIndices = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(boneIndices), usage);
        result.boneWeights = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(boneWeights), usage);
    }

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

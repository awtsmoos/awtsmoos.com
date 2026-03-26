
// B"H
/**
 * @file meshData.js
 * @brief Prepares geometry for the GPU, now equipped to extract Shape Key deltas and preserve raw arrays.
 */
import { VertexWelder } from './vertexWelder.js';
import { EdgeLedger } from './edgeLedger.js';

export function meshToRenderData(mesh) {
    // 1. Fully baked WebGL TypedArrays
    if (mesh.positions && mesh.positions.constructor === Float32Array) return mesh;

    // 2. B"H - Raw Array primitives (Grass, Grid, Particles) that skip face-topology
    if (mesh.positions && Array.isArray(mesh.positions)) {
        console.log(`B"H - 🌾 [Mesh Data]: Direct Array Manifestation detected. Converting to WebGL Buffers safely.`);
        const use32Bit = (mesh.positions.length / 3) > 65535;
        const IndexType = use32Bit ? Uint32Array : Uint16Array;
        return {
            ...mesh,
            positions: new Float32Array(mesh.positions),
            colors: new Float32Array(mesh.colors || []),
            normals: new Float32Array(mesh.normals || []),
            indices: new IndexType(mesh.indices || []),
            wireframeIndices: mesh.wireframeIndices ? new IndexType(mesh.wireframeIndices) : null
        };
    }

    const positions = [], colors = [], normals =[], indices =[];
    const boneIndices = [], boneWeights =[];
    const shapeKeysData = {}; 
    const ledger = new EdgeLedger();
    
    // 3. Fallback for completely empty meshes (Prevents WebGL crashes while allowing logic vessels)
    if (!mesh.faces || mesh.faces.length === 0) {
        return { 
            positions: new Float32Array(0), indices: new Uint16Array(0), 
            wireframeIndices: new Uint16Array(0), wireframeIndicesCount: 0,
            colors: new Float32Array(0), normals: new Float32Array(0)
        };
    }

    // 4. Standard Structured Topology Conversion
    let hasSkinning = false;
    if (mesh.faces[0].vertices[0].boneIndices) hasSkinning = true;

    let indexCounter = 0;
    const vertexMap = new Map();

    mesh.faces.forEach(face => {
        const v = face.vertices;
        if (v.length < 3) return;

        const faceIndices =[];
        v.forEach(vertex => {
            const posHash = VertexWelder.getPositionHash(vertex.pos);
            const isMouth = face.tags && face.tags.includes('mouth_inner');
            const normKey = vertex.norm ? `|N:${vertex.norm.map(n=>n.toFixed(3)).join(',')}${isMouth?"_M":""}` : '';
            const key = `${posHash}|${vertex.col ? vertex.col.join(',') : '1,1,1,1'}${normKey}`; 
            
            if (vertexMap.has(key)) {
                faceIndices.push(vertexMap.get(key));
            } else {
                const newIndex = indexCounter++;
                vertexMap.set(key, newIndex);
                faceIndices.push(newIndex);
                
                positions.push(...vertex.pos);
                colors.push(...(vertex.col || [1,1,1,1]));
                normals.push(...(vertex.norm ||[0,1,0]));
                
                if (hasSkinning) {
                    boneIndices.push(...(vertex.boneIndices ||[0,0,0,0]));
                    boneWeights.push(...(vertex.boneWeights ||[1,0,0,0]));
                }

                if (vertex.shapeKeyDeltas) {
                    for (let sk in vertex.shapeKeyDeltas) {
                        if (!shapeKeysData[sk]) shapeKeysData[sk] =[];
                        while (shapeKeysData[sk].length < (newIndex * 3)) shapeKeysData[sk].push(0,0,0);
                        shapeKeysData[sk].push(...vertex.shapeKeyDeltas[sk]);
                    }
                }
            }
        });
        
        if (v.length === 3) indices.push(faceIndices[0], faceIndices[1], faceIndices[2]);
        else if (v.length === 4) {
            indices.push(faceIndices[0], faceIndices[1], faceIndices[2]);
            indices.push(faceIndices[0], faceIndices[2], faceIndices[3]);
        } else {
            for (let i = 1; i < v.length - 1; i++) indices.push(faceIndices[0], faceIndices[i], faceIndices[i+1]);
        }
        for (let i = 0; i < v.length; i++) ledger.add(faceIndices[i], faceIndices[(i+1)%v.length]);
    });

    for (let sk in shapeKeysData) {
        while (shapeKeysData[sk].length < indexCounter * 3) shapeKeysData[sk].push(0,0,0);
    }

    let wireframeIndices = ledger.getWireframeIndices();
    const use32Bit = positions.length/3 > 65535;
    const IndexType = use32Bit ? Uint32Array : Uint16Array;

    return { 
        positions: new Float32Array(positions), 
        colors: new Float32Array(colors), 
        normals: new Float32Array(normals), 
        indices: new IndexType(indices), 
        wireframeIndices: new IndexType(wireframeIndices), 
        wireframeIndicesCount: wireframeIndices.length,
        boneIndices: hasSkinning ? new Float32Array(boneIndices) : null,
        boneWeights: hasSkinning ? new Float32Array(boneWeights) : null,
        shapeKeys: shapeKeysData, 
        drawMode: mesh.drawMode || 'TRIANGLES' 
    };
}

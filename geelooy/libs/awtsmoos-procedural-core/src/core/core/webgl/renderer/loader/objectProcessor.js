
// B"H
import { setupObjectBuffers } from '../../bufferCreator.js';
import { Skeleton } from '../../../animation/skeleton.js';
import { EdgeLedger } from '../../../geometry/utils/edgeLedger.js';

export function processSceneObject(renderer, obj) {
    if (obj.buffers) return obj; 
    
    if (obj.skeleton) {
        obj.skeletonInstance = new Skeleton(obj.skeleton.bones);
    }

    const meshData = {
        positions: obj.positions ||[],
        colors: obj.colors || [],
        normals: obj.normals ||[],
        indices: obj.indices ||[],
        wireframeIndices: obj.wireframeIndices ||[], 
        boneIndices: obj.boneIndices || null,
        boneWeights: obj.boneWeights || null,
        shapeKeys: obj.shapeKeys || null // Pass keys forward
    };

    if (meshData.positions.length > 0 && meshData.colors.length === 0) {
        const vertCount = meshData.positions.length / 3;
        meshData.colors = new Float32Array(vertCount * 4).fill(1.0);
    }

    if (meshData.indices.length > 0 && meshData.wireframeIndices.length === 0) {
        const ledger = new EdgeLedger();
        const ind = meshData.indices;
        for (let i = 0; i < ind.length; i += 3) {
            ledger.add(ind[i], ind[i+1]);
            ledger.add(ind[i+1], ind[i+2]);
            ledger.add(ind[i+2], ind[i]);
        }
        meshData.wireframeIndices = ledger.getWireframeIndices();
    }

    const instanceData = (obj.instanceCount > 0) ? {
        count: obj.instanceCount,
        offsets: obj.instanceOffsets,
        scales: obj.instanceScales,
        rotations: obj.instanceRotations,
        normals: obj.instanceNormals, 
        randoms: obj.instanceRandoms  
    } : null;

    const isMetaballSurface = obj.isMetaballSurface || false;
    const hasShapeKeys = obj.shapeKeys && Object.keys(obj.shapeKeys).length > 0;
    
    // B"H - Flag as dynamic if it has morph targets!
    const isDynamic = (obj.simulation && obj.simulation.type === 'cloth') || isMetaballSurface || hasShapeKeys;

    const buffers = setupObjectBuffers(renderer.gl, meshData, obj.id, instanceData, isDynamic);
    
    if (buffers) {
        obj.buffers = buffers;
        obj.indicesCount = meshData.indices.length;
        
        // B"H - Preserve the uncorrupted base positions for shape key interpolation
        if (hasShapeKeys) {
            obj.basePositions = new Float32Array(meshData.positions);
        }
        
        if (renderer.animationManager) {
            renderer.animationManager.registerObject(obj.id, obj.animations);
        }
        
        if (isDynamic && renderer.clothSystem && !isMetaballSurface && !hasShapeKeys) {
             renderer.clothSystem.addClothObject(obj, obj.simulation.config || {});
        }
    }
    
    if (obj.children && Array.isArray(obj.children)) {
        obj.children = obj.children.map(child => processSceneObject(renderer, child)).filter(Boolean); 
    }
    return obj;
}

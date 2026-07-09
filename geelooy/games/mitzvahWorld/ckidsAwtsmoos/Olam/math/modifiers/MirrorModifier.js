
/**
 * B"H
 * @module MirrorModifier
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class MirrorModifier {
    static apply(geometry, mod) {
        const geometries = [geometry.clone()];
        
        const axis = mod.axis || 'x'; // 'x', 'y', or 'z'
        
        const mirrorClone = geometry.clone();
        const matrix = new THREE.Matrix4();
        
        if (axis === 'x') matrix.makeScale(-1, 1, 1);
        if (axis === 'y') matrix.makeScale(1, -1, 1);
        if (axis === 'z') matrix.makeScale(1, 1, -1);
        
        mirrorClone.applyMatrix4(matrix);
        
        // Reverse winding order to fix normals after negative scaling
        const pos = mirrorClone.attributes.position;
        const norm = mirrorClone.attributes.normal;
        const uvs = mirrorClone.attributes.uv;
        const idx = mirrorClone.index;
        
        if (idx) {
            for (let i = 0; i < idx.count; i += 3) {
                const temp = idx.getX(i + 1);
                idx.setX(i + 1, idx.getX(i + 2));
                idx.setX(i + 2, temp);
            }
        }
        
        geometries.push(mirrorClone);

        return BufferGeometryUtils.mergeGeometries(geometries);
    }
}

// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class ModifierFactory {
    static apply(geo, mod) {
        if (!geo) return null;

        switch (mod.type) {
            case 'translate':
                geo.translate(mod.x || 0, mod.y || 0, mod.z || 0);
                break;
            case 'rotate':
                if (mod.x) geo.rotateX(mod.x);
                if (mod.y) geo.rotateY(mod.y);
                if (mod.z) geo.rotateZ(mod.z);
                break;
            case 'scale':
                geo.scale(mod.x ?? 1, mod.y ?? 1, mod.z ?? 1);
                break;
            case 'mirror':
                const mirrored = geo.clone();
                const matrix = new THREE.Matrix4();
                if (mod.axis === 'x') matrix.makeScale(-1, 1, 1);
                else if (mod.axis === 'y') matrix.makeScale(1, -1, 1);
                else if (mod.axis === 'z') matrix.makeScale(1, 1, -1);
                mirrored.applyMatrix4(matrix);
                return BufferGeometryUtils.mergeGeometries([geo, mirrored], false);
            case 'array':
                const count = mod.count || 1;
                const offset = mod.offset || { x: 0, y: 0, z: 0 };
                const geometries = [geo];
                for (let i = 1; i < count; i++) {
                    const clone = geo.clone();
                    clone.translate(offset.x * i, offset.y * i, offset.z * i);
                    geometries.push(clone);
                }
                return BufferGeometryUtils.mergeGeometries(geometries, false);
        }
        return geo;
    }
}

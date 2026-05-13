// B"H
/**
 * @file GeometryModifiers.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE VESSELS OF TRANSFORMATION — Divine Geometry Modifiers              ║
 * ║                                                                          ║
 * ║  "And he shall make of it a single beaten work..."                       ║
 * ║                                                                          ║
 * ║  Direct manipulation of the raw fabric of space (BufferGeometry)         ║
 * ║  to create complex forms from simple primitives dynamically.             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';

export class GeometryModifiers {
    
    /**
     * B"H
     * @method applyModifiers
     * @description
     * 🌀 CHAPTER 2: THE TZIMTZUM OF SPACE 🌀
     * 
     * "And He contracted His Light..."
     * The raw geometry (the vessel) is subjected to the Modifiers (the Tzimtzumim),
     * which shape, mirror, and expand the form according to the Divine Blueprint.
     * 
     * Each modifier is a specific operation on the BufferGeometry attributes,
     * physically rearranging the atoms of the digital world to manifest the 
     * Will of the Architect.
     * 
     * @param {THREE.BufferGeometry} geometry - The raw vessel of space.
     * @param {Array} modifiers - The sequence of contractions to apply.
     * @param {Function} resolveFn - The channel of variable resolution.
     * @returns {THREE.BufferGeometry} The refined and sanctified geometry.
     */
    static applyModifiers(geometry, modifiers = [], resolveFn) {
        if (!modifiers || !modifiers.length) return geometry;
        
        let currentGeo = geometry.clone();

        for (const mod of modifiers) {
            const type = resolveFn(mod.type);
            const p = mod.params || {};

            if (type === 'scaleMesh') {
                const s = (p.scale || [1,1,1]).map(resolveFn);
                currentGeo.scale(s[0], s[1], s[2]);
            }
            else if (type === 'array') {
                const count = resolveFn(p.count || 1);
                const offset = (p.offset || [0,0,0]).map(resolveFn);
                const geos = [];
                for (let i = 0; i < count; i++) {
                    const cloned = currentGeo.clone();
                    cloned.translate(offset[0] * i, offset[1] * i, offset[2] * i);
                    geos.push(cloned);
                }
                currentGeo = BufferGeometryUtils.mergeBufferGeometries(geos, false);
            }
            else if (type === 'mirror') {
                const axis = resolveFn(p.axis || 'x');
                const cloned = currentGeo.clone();
                if (axis === 'x') cloned.scale(-1, 1, 1);
                else if (axis === 'y') cloned.scale(1, -1, 1);
                else if (axis === 'z') cloned.scale(1, 1, -1);
                
                // When scaling by -1, normals get inverted. We need to flip them.
                this._flipNormals(cloned);
                
                currentGeo = BufferGeometryUtils.mergeBufferGeometries([currentGeo, cloned], false);
            }
            else if (type === 'extrude') {
                // A simplified direct vertex manipulation for extruding outward from the center
                const amount = resolveFn(p.amount || 0);
                const axis = resolveFn(p.axis || 'y');
                const threshold = resolveFn(p.threshold || 0.001); // Which vertices to affect based on distance from center
                
                const pos = currentGeo.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    let val;
                    if (axis === 'x') val = pos.getX(i);
                    else if (axis === 'y') val = pos.getY(i);
                    else if (axis === 'z') val = pos.getZ(i);

                    // If vertex is on the positive side of the center, pull it further out
                    if (val > threshold) {
                        if (axis === 'x') pos.setX(i, val + amount);
                        else if (axis === 'y') pos.setY(i, val + amount);
                        else if (axis === 'z') pos.setZ(i, val + amount);
                    }
                    // If on the negative side, pull it further out negatively
                    else if (val < -threshold) {
                        if (axis === 'x') pos.setX(i, val - amount);
                        else if (axis === 'y') pos.setY(i, val - amount);
                        else if (axis === 'z') pos.setZ(i, val - amount);
                    }
                }
                currentGeo.computeVertexNormals();
            }
            else if (type === 'translateVertex') {
                // Translates all vertices within a certain bounding box
                const boundsMin = (p.boundsMin || [-1, -1, -1]).map(resolveFn);
                const boundsMax = (p.boundsMax || [1, 1, 1]).map(resolveFn);
                const translation = (p.translation || [0,0,0]).map(resolveFn);

                const pos = currentGeo.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    const x = pos.getX(i);
                    const y = pos.getY(i);
                    const z = pos.getZ(i);

                    if (x >= boundsMin[0] && x <= boundsMax[0] &&
                        y >= boundsMin[1] && y <= boundsMax[1] &&
                        z >= boundsMin[2] && z <= boundsMax[2]) {
                        
                        pos.setXYZ(i, x + translation[0], y + translation[1], z + translation[2]);
                    }
                }
                currentGeo.computeVertexNormals();
            }
            else if (type === 'rotateMesh') {
                const r = (p.rotation || [0,0,0]).map(resolveFn);
                currentGeo.rotateX(r[0]);
                currentGeo.rotateY(r[1]);
                currentGeo.rotateZ(r[2]);
            }
            else if (type === 'translateMesh') {
                const t = (p.position || [0,0,0]).map(resolveFn);
                currentGeo.translate(t[0], t[1], t[2]);
            }
            else if (type === 'centerMesh') {
                currentGeo.center();
            }
            else if (type === 'noise') {
                const amount = resolveFn(p.amount || 0.1);
                const pos = currentGeo.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    pos.setXYZ(
                        i,
                        pos.getX(i) + (Math.random() - 0.5) * amount,
                        pos.getY(i) + (Math.random() - 0.5) * amount,
                        pos.getZ(i) + (Math.random() - 0.5) * amount
                    );
                }
                currentGeo.computeVertexNormals();
            }
        }
        
        return currentGeo;
    }

    /**
     * @method _flipNormals
     * @description Reverses face winding and normals for a mirrored geometry.
     */
    static _flipNormals(geometry) {
        if (geometry.index) {
            const index = geometry.index.array;
            for (let i = 0; i < index.length; i += 3) {
                const temp = index[i + 1];
                index[i + 1] = index[i + 2];
                index[i + 2] = temp;
            }
        }
        geometry.computeVertexNormals();
    }
}

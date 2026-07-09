
/**
 * B"H
 * @module ArrayModifier
 * @description
 * Chapter 8: Multiplicity within Unity
 * "One becomes many, yet the source remains One."
 * This updated modifier allows a single primordial geometry to manifest 
 * multiple times across the canvas of space. It now supports the Path Decree,
 * taking a list of coordinates (the sidewalk's path) and placing the vessel 
 * sequentially, creating roads and linear structures.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class ArrayModifier {
    static gematriaMap = {'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,'כ':20,'ל':30,'מ':40,'נ':50,'ס':60,'ע':70,'פ':80,'צ':90,'ק':100,'ר':200,'ש':300,'ת':400,'ך':20,'ם':40,'ן':50,'ף':80,'ץ':90};

    static calculateGematria(str) {
        if (!str) return 1;
        return str.split('').reduce((sum, char) => sum + (this.gematriaMap[char] || 0), 0) || 1;
    }

    /**
     * @function apply
     * @param {THREE.BufferGeometry} geometry 
     * @param {Object} mod 
     */
    static apply(geometry, mod) {
        const geometries =[];
        
        // B"H: PATH DECREE - Mapping one to many via coordinates
        if (mod.type === 'path' && Array.isArray(mod.points)) {
            for (let i = 0; i < mod.points.length; i++) {
                const p = mod.points[i];
                const clone = geometry.clone();
                const matrix = new THREE.Matrix4();
                
                matrix.makeTranslation(p.x || 0, p.y || 0, p.z || 0);
                
                // B"H: Orientation Logic - look at next point to align the path segment
                if (mod.autoAlign && i < mod.points.length - 1) {
                    const next = mod.points[i+1];
                    const lookMat = new THREE.Matrix4().lookAt(
                        new THREE.Vector3(p.x, p.y, p.z),
                        new THREE.Vector3(next.x, next.y, next.z),
                        new THREE.Vector3(0, 1, 0)
                    );
                    matrix.multiply(lookMat);
                }

                clone.applyMatrix4(matrix);
                geometries.push(clone);
            }
        } 
        // RADIAL/LINEAR ARRAY (Original Logic)
        else {
            let count = mod.count || 1;
            if (mod.type === 'gematria') count = this.calculateGematria(mod.text);
            count = Math.min(count, 512); // Safety boundary

            for (let i = 0; i < count; i++) {
                const clone = geometry.clone();
                const matrix = new THREE.Matrix4();
                
                if (mod.type === 'radial') {
                    const radius = mod.radius || 5;
                    const angle = (i / count) * Math.PI * 2;
                    matrix.makeTranslation(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
                    if (mod.alignToCurve !== false) {
                        const rotY = new THREE.Matrix4().makeRotationY(-angle);
                        matrix.multiply(rotY);
                    }
                } else {
                    const offset = mod.offset || { x: 1, y: 0, z: 0 };
                    matrix.makeTranslation(offset.x * i, offset.y * i, offset.z * i);
                    if (mod.rotation) {
                        const rotMat = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(
                            THREE.MathUtils.degToRad((mod.rotation.x || 0) * i),
                            THREE.MathUtils.degToRad((mod.rotation.y || 0) * i),
                            THREE.MathUtils.degToRad((mod.rotation.z || 0) * i)
                        ));
                        matrix.multiply(rotMat);
                    }
                }
                clone.applyMatrix4(matrix);
                geometries.push(clone);
            }
        }

        if (geometries.length === 0) return geometry;
        return BufferGeometryUtils.mergeGeometries(geometries);
    }
}

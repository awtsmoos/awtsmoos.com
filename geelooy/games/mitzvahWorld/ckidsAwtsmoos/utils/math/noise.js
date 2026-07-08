
/**
 * B"H
 * Simplex Noise Utility for Shaders
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export function simplex2d(v) {
    const C = new THREE.Vector4(
        0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439
    );
    let i = new THREE.Vector2(Math.floor(v.x + C.y * (v.x + v.y)), Math.floor(v.y + C.y * (v.x + v.y)));
    let x0 = new THREE.Vector2(v.x - i.x + C.x * (i.x + i.y), v.y - i.y + C.x * (i.x + i.y));
    let i1 = new THREE.Vector2((x0.x > x0.y) ? 1.0 : 0.0, (x0.x > x0.y) ? 0.0 : 1.0);
    let x12 = new THREE.Vector4(x0.x + C.x - i1.x, x0.y + C.x - i1.y, x0.x + C.z, x0.y + C.z);
    
    i = new THREE.Vector2(
        i.x - Math.floor(i.x * (1.0 / 289.0)) * 289.0,
        i.y - Math.floor(i.y * (1.0 / 289.0)) * 289.0
    );

    const mod289 = (x) => x - Math.floor(x * (1.0 / 289.0)) * 289.0;
    const permute = (x) => mod289(((x * 34.0) + 1.0) * x);

    let p = new THREE.Vector3(i.y, i.y + i1.y, i.y + 1.0);
    
    // Manual permute logic to avoid extra vector allocations if possible, but keeping consistent with ref
    let p_perm = permute(p); // x, y, z
    
    // Mix
    let p1_x = p_perm.x + i.x;
    let p1_y = p_perm.y + i.x + i1.x;
    let p1_z = p_perm.z + i.x + 1.0;
    
    let p_final = permute(new THREE.Vector3(p1_x, p1_y, p1_z));

    let m = new THREE.Vector3(
        Math.max(0.0, 0.5 - x0.dot(x0)),
        Math.max(0.0, 0.5 - (x12.x * x12.x + x12.y * x12.y)),
        Math.max(0.0, 0.5 - (x12.z * x12.z + x12.w * x12.w))
    );
    
    m.x = m.x * m.x * m.x * m.x; // Pow 4
    m.y = m.y * m.y * m.y * m.y;
    m.z = m.z * m.z * m.z * m.z;

    let x = new THREE.Vector3(
        2.0 * ((p_final.x * C.w) - Math.floor(p_final.x * C.w)) - 1.0,
        2.0 * ((p_final.y * C.w) - Math.floor(p_final.y * C.w)) - 1.0,
        2.0 * ((p_final.z * C.w) - Math.floor(p_final.z * C.w)) - 1.0
    );
    
    let h = new THREE.Vector3(Math.abs(x.x) - 0.5, Math.abs(x.y) - 0.5, Math.abs(x.z) - 0.5);
    let ox = new THREE.Vector3(Math.floor(x.x + 0.5), Math.floor(x.y + 0.5), Math.floor(x.z + 0.5));
    let a0 = new THREE.Vector3(x.x - ox.x, x.y - ox.y, x.z - ox.z);

    // Normalise
    let norm = 1.79284291400159 - 0.85373472095314 * (a0.x * a0.x + h.x * h.x);
    m.x *= norm; 
    norm = 1.79284291400159 - 0.85373472095314 * (a0.y * a0.y + h.y * h.y);
    m.y *= norm;
    norm = 1.79284291400159 - 0.85373472095314 * (a0.z * a0.z + h.z * h.z);
    m.z *= norm;

    let g = new THREE.Vector3(
        a0.x * x0.x + h.x * x0.y,
        a0.y * x12.x + h.y * x12.y,
        a0.z * x12.z + h.z * x12.w
    );

    return 130.0 * m.dot(g);
}

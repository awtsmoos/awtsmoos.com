//B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

export default class GeometryModifier {
    constructor(olam) { this.olam = olam; }
    modify(mesh, point, radius, strength = 1.0) {
        if (!mesh.geometry) return;
        if (!mesh.userData.isUnique) { mesh.geometry = mesh.geometry.clone(); mesh.userData.isUnique = true; }
        const localPoint = mesh.worldToLocal(point.clone());
        const posAttr = mesh.geometry.attributes.position;
        const normAttr = mesh.geometry.attributes.normal;
        let modified = false; const v = new THREE.Vector3(), n = new THREE.Vector3();
        for (let i = 0; i < posAttr.count; i++) {
            v.fromBufferAttribute(posAttr, i); const d = v.distanceTo(localPoint);
            if (d < radius) {
                const falloff = 0.5 * (1 + Math.cos(Math.PI * d / radius));
                n.fromBufferAttribute(normAttr, i);
                v.add(n.multiplyScalar(-strength * falloff));
                posAttr.setXYZ(i, v.x, v.y, v.z); modified = true;
            }
        }
        if (modified) {
            posAttr.needsUpdate = true; mesh.geometry.computeVertexNormals();
            this.olam.worldOctree.removeMesh(mesh); this.olam.worldOctree.addObject(mesh);
        }
    }
}
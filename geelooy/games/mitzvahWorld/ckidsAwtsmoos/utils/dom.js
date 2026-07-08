
/**
 * B"H
 * DOM and Scene Utilities
 * "And He rested on the seventh day from all His work which He had made."
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default class DomUtils {
    static replaceMaterialsWithLambert(obj) {
        if (!obj) return;
        obj.traverse(child => {
            if (child.isMesh) {
                this.replaceMaterialWithLambert(child);
            }
        });
    }

    static replaceMaterialWithLambert(mesh) {
        if (!mesh || !mesh.material) return;
        
        const oldMat = mesh.material;
        const color = oldMat.color || new THREE.Color(0xffffff);
        const map = oldMat.map || null;

        mesh.material = new THREE.MeshLambertMaterial({
            color: color,
            map: map,
            side: oldMat.side || THREE.FrontSide,
            transparent: oldMat.transparent || false,
            opacity: oldMat.opacity !== undefined ? oldMat.opacity : 1
        });

        // B"H: silent

        return mesh.material;
    }

    static getSolid(mesh) {
        return this.searchForMesh(mesh, "solid");
    }

    static searchForMesh(mesh, name) {
        if(mesh && mesh instanceof THREE.Object3D) {
            var found = null;
            mesh.traverse(child => {
                if(child.name == name) {
                    found = child;
                }
            });
            return found;
        }
        return null;
    }
}

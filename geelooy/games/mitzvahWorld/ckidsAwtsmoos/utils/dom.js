/**
 * B"H
 * DOM and Scene Utilities
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class DomUtils {
    static replaceMaterialsWithLambert(gltf) {
        gltf.scene.traverse((child) => {
            this.replaceMaterialWithLambert(child)
        });
    }

    static replaceMaterialWithLambert(mesh) {
        if (mesh.isMesh && mesh.material instanceof THREE.MeshStandardMaterial) {
            let oldMat = mesh.material;
            let newMat = new THREE.MeshLambertMaterial();
            Object.keys(oldMat).forEach(k => {
                newMat[k] = oldMat[k]
            });
            mesh.material = newMat;
            return newMat;
        }
        return null;
    }

    static getSolid(mesh) {
        return this.searchForMesh(mesh, "solid");
    }

    static searchForMesh(mesh,name) {
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
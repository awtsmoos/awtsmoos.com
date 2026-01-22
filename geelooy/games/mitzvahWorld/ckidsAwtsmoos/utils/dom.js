/**
 * B"H
 * DOM and Scene Utilities
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class DomUtils {
    /**
     * replaceMaterialsWithLambert - Recursively upgrades materials to Lambert vessels.
     */
    static replaceMaterialsWithLambert(gltf) {
        gltf.scene.traverse((child) => {
            this.replaceMaterialWithLambert(child)
        });
    }

    /**
     * chainOnBeforeCompile - The act of unification. 
     * Allows multiple spiritual systems to bind their logic to a single material's manifestation.
     */
    static chainOnBeforeCompile(material, newFunction) {
        const oldFunction = material.onBeforeCompile;
        material.onBeforeCompile = function(shader, renderer) {
            if (oldFunction) oldFunction.call(this, shader, renderer);
            newFunction.call(this, shader, renderer);
        };
    }

    /**
     * replaceMaterialWithLambert - Substitutes heavy materials with optimized Lambert versions.
     * Respects Terrain protection to prevent stripping custom shaders.
     */
    static replaceMaterialWithLambert(mesh) {
        if (!mesh.isMesh) return null;
        
        // B"H: Guard - Do not erase custom terrain shaders or meshes already processed by TextureMixer
        if (mesh.userData.isTerrain) return null;

        if (mesh.material instanceof THREE.MeshStandardMaterial) {
            let oldMat = mesh.material;
            let newMat = new THREE.MeshLambertMaterial();
            
            // Transfer properties that exist on both
            Object.keys(oldMat).forEach(k => {
                if (newMat.hasOwnProperty(k)) {
                    newMat[k] = oldMat[k];
                }
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

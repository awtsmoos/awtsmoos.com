
/**
 * B"H
 * DOM and Scene Utilities
 * "And He rested on the seventh day from all His work which He had made."
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class DomUtils {
    static replaceMaterialsWithLambert(gltf) {
        // B"H: The Great Tikkun. 
        // We preserve the original divine intent of the materials.
        // Converting to Lambert destroyed PBR properties and caused shader paradoxes.
        // This function is now nullified. Let the Standard Materials shine!
        console.log("B\"H - Preserving pure PBR materials. No Lambert conversion applied.");
    }

    static replaceMaterialWithLambert(mesh) {
        // Nullified.
        return mesh ? mesh.material : null;
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

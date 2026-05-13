// B"H
/**
 * @file graphics.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE RADIANCE OF FORM — Visual Manifestation               ║
 * ║                                                             ║
 * ║  "Behold, I have called by name Bezalel..."                ║
 * ║  (Shemos 31:2)                                              ║
 * ║                                                             ║
 * ║  The craftsman's logic, sculpting the wood and the light   ║
 * ║  into a vessel that can be seen and touched.               ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js';
import GeometryManager from "../../../Olam/math/GeometryManager.js";
import { DOOR_DEFAULTS } from '../constants.js';

export default {
    /**
     * @method buildGeometryManually
     * @description Fallback geometry builder using the unified GeometryManager.
     */
    buildGeometryManually() {
        return GeometryManager.create(
            "DoorGeometry",
            [DOOR_DEFAULTS.width, DOOR_DEFAULTS.height, DOOR_DEFAULTS.thickness]
        ) || new THREE.BoxGeometry(
            DOOR_DEFAULTS.width, DOOR_DEFAULTS.height, DOOR_DEFAULTS.thickness
        );
    },

    /**
     * @method _highlight
     * @description Applies an emissive glow to the door during hover.
     */
    _highlight(state) {
        if (!this.mesh) return;
        this.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(mat => {
                    if (mat.emissive) {
                        if (state) {
                            if (mat.userData.oldEmissive === undefined) {
                                mat.userData.oldEmissive = mat.emissive.clone();
                            }
                            mat.emissive.setHex(0x333311);
                        } else {
                            if (mat.userData.oldEmissive !== undefined) {
                                mat.emissive.copy(mat.userData.oldEmissive);
                            }
                        }
                    }
                });
            }
        });
    }
};

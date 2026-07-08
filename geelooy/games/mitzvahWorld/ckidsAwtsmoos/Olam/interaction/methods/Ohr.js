/**
 * B"H
 * 
 * THE OHR (LIGHT) - REVELATION OF THE ESSENCE
 * 
 * When the Kav touches a Nivra, the Ohr must shine.
 * This is not a mere "hover state"; it is the revelation of the 
 * underlying divine energy that sustains the object.
 * 
 * "The soul of man is the candle of G-d."
 * In the digital realm, the emissive glow is the soul of the mesh.
 * 
 * UNIVERSAL APPROACH:
 *   - For MeshStandardMaterial / MeshPhongMaterial: boost emissive
 *   - For MeshLambertMaterial: boost emissive (Lambert HAS emissive in THREE.js!)
 *   - For ShaderMaterial with uHighlight uniform: set it
 *   - For materials with NO emissive: temporarily swap color lighter
 * 
 * @module Ohr
 */

import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * @class Ohr
 * @description Manages the visual highlighting of objects with a spiritual glow.
 */
export default class Ohr {
    constructor() {
        /**
         * @property {Map} savedStates
         * @description Stores original material properties to restore them later.
         */
        this.savedStates = new Map();
    }

    /**
     * @method highlight
     * @description Illuminates or dims a mesh by revealing its inner light.
     * @param {THREE.Object3D} root - The root object to highlight.
     * @param {boolean} active - Whether to activate the revelation.
     */
    highlight(root, active) {
        if (!root) return;

        root.traverse((child) => {
            if (!child.isMesh || !child.material) return;
            // B"H: Skip invisible proxy meshes
            if (child.material.visible === false || child.material.opacity === 0) return;

            const materials = Array.isArray(child.material) ? child.material : [child.material];
            
            if (active) {
                this.illuminate(child, materials);
            } else {
                this.conceal(child, materials);
            }
        });
    }

    /**
     * @private
     * @method illuminate
     * @description Adds the light of the Essence to the material.
     * Works with ANY material type in THREE.js.
     */
    illuminate(child, materials) {
        if (this.savedStates.has(child)) return; // Already illuminated

        const saved = materials.map(m => {
            const state = {};

            // B"H: Check for custom shader uniform (used by doors/NPCs with custom shaders)
            if (m.userData && m.userData.shader && m.userData.shader.uniforms && m.userData.shader.uniforms.uHighlight !== undefined) {
                state.type = 'shader';
                state.prevHighlight = m.userData.shader.uniforms.uHighlight.value;
                m.userData.shader.uniforms.uHighlight.value = 1.0;
                return state;
            }

            // B"H: For materials with emissive property (Standard, Phong, Lambert)
            if (m.emissive !== undefined) {
                state.type = 'emissive';
                state.emissive = m.emissive.clone();
                state.emissiveIntensity = m.emissiveIntensity;
                m.emissive.set(0x333333);
                m.emissiveIntensity = (m.emissiveIntensity || 0) + 0.6;
                return state;
            }

            // B"H: For ShaderMaterial or raw material — tint color if it exists
            if (m.color) {
                state.type = 'color';
                state.color = m.color.clone();
                const c = m.color;
                c.r = Math.min(1.0, c.r + 0.15);
                c.g = Math.min(1.0, c.g + 0.15);
                c.b = Math.min(1.0, c.b + 0.15);
                return state;
            }

            state.type = 'none';
            return state;
        });

        this.savedStates.set(child, saved);
    }

    /**
     * @private
     * @method conceal
     * @description Returns the material to its mundane concealment.
     */
    conceal(child, materials) {
        const saved = this.savedStates.get(child);
        if (!saved) return;

        materials.forEach((m, i) => {
            const s = saved[i];
            if (!s) return;

            if (s.type === 'shader') {
                if (m.userData && m.userData.shader && m.userData.shader.uniforms && m.userData.shader.uniforms.uHighlight !== undefined) {
                    m.userData.shader.uniforms.uHighlight.value = s.prevHighlight;
                }
            } else if (s.type === 'emissive') {
                m.emissive.copy(s.emissive);
                m.emissiveIntensity = s.emissiveIntensity;
            } else if (s.type === 'color') {
                m.color.copy(s.color);
            }
        });

        this.savedStates.delete(child);
    }
}

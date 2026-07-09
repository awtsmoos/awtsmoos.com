
/**
 * @file UniformScribe.js
 * @description
 * 📜 CHAPTER 1: THE INSCRIBING OF THE SPARKS 📜
 * 
 * In the high realms of Atzilut, colors are infinite. But to be 
 * seen in Asiyah, they must be contracted (Tzimtzum) into 
 * numbers. This scribe translates your data into the 
 * language of the GPU.
 */

import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class UniformScribe {
    /**
     * @method sanctify
     * @description Translates plain object uniforms into THREE objects.
     * @param {Object} rawSnippets - The raw uniform descriptors.
     * @returns {Object} Three-compatible uniforms map.
     */
    static sanctify(rawSnippets) {
        if (!rawSnippets) return {};
        const safe = {};
        
        for (const [key, uniform] of Object.entries(rawSnippets)) {
            let value = uniform.value;
            
            // B"H: If it looks like a color, make it a Color
            if (value && typeof value === 'object') {
                if (value.r !== undefined) {
                    value = new THREE.Color(value.r, value.g, value.b);
                    console.log(`B"H - 🎨 [UniformScribe] Sanctifying color [${key}]:`, value.getHex().toString(16));
                } else if (value.x !== undefined) {
                    value = new THREE.Vector3(value.x, value.y, value.z);
                    console.log(`B"H - 📐 [UniformScribe] Sanctifying vector [${key}]:`, value);
                }
            }
            
            safe[key] = { value };
        }
        return safe;
    }
}

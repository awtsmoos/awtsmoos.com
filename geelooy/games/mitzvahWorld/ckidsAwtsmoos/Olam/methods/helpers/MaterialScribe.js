
/**
 * @module MaterialScribe
 * @description
 * B"H
 * 🎨 CHAPTER 22: THE EMBROIDERING OF THE COAT 🎨
 */
import * as THREE from '/games/scripts/build/three.module.js';
import SafeMaterialApplier from './SafeMaterialApplier.js';

export default class MaterialScribe {
    /**
     * @method scribe
     * @description Translates the abstract intention of color and pattern into a Three.js material.
     */
    static async scribe(toyrName, rawParams, olam) {
        // B"H: If the material name itself is a type of shader
        if (toyrName === 'AwtsmoosGrassMaterial') {
             const mat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
             // We use a dynamic import to avoid worker boot stalls
             const { default: GrassShader } = await import('../procedural/Shaders/Grass/index.js');
             GrassShader.apply(mat);
             return mat;
        }

        try {
            const processed = await this._processDivineOptions(rawParams, olam);
            return SafeMaterialApplier.apply(toyrName, processed);
        } catch (e) {
            console.error(`B"H - 🚨 THE INK SPILLED during [${toyrName}]:`, e);
            return new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true });
        }
    }

    static async _processDivineOptions(raw, olam) {
        const clean = {};
        for (const [key, val] of Object.entries(raw || {})) {
            if (key === 'color' || key === 'emissive') {
                clean[key] = new THREE.Color(val);
            } else if (key === 'map' && typeof val === 'string') {
                if (olam && olam.loadTexture) {
                    let urlToLoad = val;
                    if (val.startsWith("awtsmoos://")) {
                        urlToLoad = olam.getComponent(val);
                    }
                    
                    if (urlToLoad) {
                        const tex = await olam.loadTexture({ url: urlToLoad });
                        if (tex) {
                             console.log(`B"H - 🖼️ [MaterialScribe]: Map manifest for [${urlToLoad}]`);
                             clean[key] = tex;
                        }
                    }
                }
            } else {
                clean[key] = val;
            }
        }
        return clean;
    }
}


/**
 * @module MaterialScribe
 * @description
 * B"H
 * 🎨 CHAPTER 22: THE EMBROIDERING OF THE COAT 🎨
 * 
 * Just as the soul requires garments (Levushim) to function in the world,
 * our 3D vessels require Materials to be seen. This scribe takes the 
 * abstract will of color and texture and engraves it into the GPU.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import SafeMaterialApplier from './SafeMaterialApplier.js';

export default class MaterialScribe {
    static async scribe(toyrName, rawParams, olam) {
        try {
            const processed = await this._processDivineOptions(rawParams, olam);
            const material = SafeMaterialApplier.apply(toyrName, processed);
            
            // B"H: silent

            // B"H: THE MATRIX COVENANT
            // Some procedural textures come from the void without a UV matrix.
            // We ensure it exists here to prevent 'reading elements of undefined' in shaders.
            const slots =['map', 'normalMap', 'emissiveMap', 'lightMap'];
            slots.forEach(s => {
                if (material[s] && material[s].isTexture && !material[s].matrix) {
                    material[s].matrix = new THREE.Matrix3();
                    // B"H: silent

                }
            });

            return material;
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
                    if (val.startsWith("awtsmoos://") || val.startsWith("awtsmoostex://")) {
                        urlToLoad = olam.getComponent(val) || val;
                    }
                    
                    if (urlToLoad) {
                        const tex = await olam.loadTexture({ url: urlToLoad });
                        if (tex) {
                             // Force matrix existence immediately upon load
                             if (!tex.matrix) tex.matrix = new THREE.Matrix3();
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


/**
 * B"H
 * @module MaterialScribe
 * @description
 * 🎨 CHAPTER 22: THE EMBROIDERING OF THE COAT 🎨
 * 
 * Geometry is but a dead bone until the Material (Toyr) is spoken upon it.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import SafeMaterialApplier from './SafeMaterialApplier.js';

export default class MaterialScribe {
    static async scribe(toyrName, rawParams, olam) {
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
                    let urlToLoad = val.startsWith("awtsmoos://") ? olam.getComponent(val) : val;
                    if (urlToLoad) {
                        clean[key] = await olam.loadTexture({ url: urlToLoad });
                    } else {
                        clean[key] = null;
                    }
                }
            } else {
                clean[key] = val;
            }
        }
        return clean;
    }
}

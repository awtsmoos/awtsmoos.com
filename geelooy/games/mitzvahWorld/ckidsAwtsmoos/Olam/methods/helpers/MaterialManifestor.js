
/**
 * B"H
 * @module MaterialManifestor
 * @description
 * 🎨 CHAPTER 19: THE WEAVING OF THE LEVUSHIM (GARMENTS) 🎨
 * 
 * "He wraps Himself in Light as with a garment." (Tehillim 104:2)
 * 
 * Pure geometry is invisible without the 'Toyr' (Form/Material). This module 
 * constructs the garments that allow the eye to perceive the manifested vessels.
 * It carefully handles color interpretation and texture mapping.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import SafeMaterialApplier from './SafeMaterialApplier.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

export default class MaterialManifestor {
    /**
     * @function manifest
     * @description Synthesizes a Material from the Golem's 'toyr' instructions.
     * @param {Object} toyrSchema - The JSON material definition.
     * @param {Object} olamContext - Access to the Olam for texture loading.
     * @returns {Promise<THREE.Material|Array<THREE.Material>>}
     */
    static async manifest(toyrSchema, olamContext) {
        if (!toyrSchema) {
            return new THREE.MeshLambertMaterial({ color: 0xffffff });
        }

        const entries = Object.entries(toyrSchema);
        if (entries.length === 0) return new THREE.MeshLambertMaterial({ color: 0xffffff });

        const [matName, rawOptions] = entries[0];
        // B"H: silent


        try {
            // Handle groups of materials (like for a door with separate wood and gold parts)
            if (matName === "MaterialArray" && Array.isArray(rawOptions)) {
                return await Promise.all(rawOptions.map(async (entry) => {
                    const [subName, subOpts] = Object.entries(entry)[0];
                    const proc = await this._processOptions(subOpts, olamContext);
                    return SafeMaterialApplier.apply(subName, proc);
                }));
            }

            // Single standard material
            const processedOptions = await this._processOptions(rawOptions, olamContext);
            const material = SafeMaterialApplier.apply(matName, processedOptions);
            
            return material;
        } catch (e) {
            console.error(`B"H - 🚨 THE LOOM SHATTERED during [${matName}]:`, e);
            return new THREE.MeshBasicMaterial({ color: 0xff00ea, wireframe: true });
        }
    }

    /**
     * @private
     * @function _processOptions
     * @description Translates JSON types (hex strings) into Three.js objects (Colors, Textures).
     */
    static async _processOptions(opts, olam) {
        const results = {};
        for (const [key, val] of Object.entries(opts || {})) {
            if (key === 'color' || key === 'emissive') {
                results[key] = new THREE.Color(val);
            } else if (key === 'map' && typeof val === 'string') {
                // If it's a map pointer, we MUST load it
                if (olam && olam.loadTexture) {
                    const url = val.startsWith("awtsmoos://") ? olam.getComponent(val) : val;
                    if (url) {
                        results[key] = await olam.loadTexture({ url });
                    }
                }
            } else {
                results[key] = val;
            }
        }
        return results;
    }
}


/**
 * B"H
 * @module TerrainMaterialScribe
 * @description
 * 🎨 THE PAINTER OF THE FIELD 🎨
 * 
 * "Let the earth sprout vegetation..." (Bereishis 1:11)
 * This module extracts the massive shader logic from the Terrain object.
 * It loads the texture via the Olam and compiles the GLSL snippets.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { GRASS_TERRAIN_SNIPPETS } from './TerrainShaderSnippets.js';

export default class TerrainMaterialScribe {
    /**
     * @function scribe
     * @description Forges the material for the earth.
     * @param {Object} data - The terrain blueprint.
     * @param {Object} olam - The world engine.
     * @param {Object} nivra - The calling entity (for material generation).
     * @returns {Promise<THREE.Material>}
     */
    static async scribe(data, olam, nivra) {
        let grassTex = null;
        if (olam && typeof olam.loadTexture === 'function') {
            try {
                // B"H: Drawing down the holy texture of the earth
                grassTex = await olam.loadTexture({ 
                    url: 'awtsmoostex://' + (data.textureType || 'safegrass'), 
                    shouldRepeat: true, 
                    repeatX: data.width / 20, 
                    repeatY: data.depth / 20 
                });
            } catch (e) {
                console.warn("B\"H - ⚠️ [TerrainMaterialScribe] Texture loading failed:", e);
            }
        }

        // B"H: We utilize the Olam's built-in material compiler
        if (typeof nivra.createMaterial === 'function') {
            return nivra.createMaterial('Lambert', { 
                color: 0xffffff, 
                map: grassTex,
                side: 2 
            }, GRASS_TERRAIN_SNIPPETS);
        } else {
            // Fallback if the method is missing
            return new THREE.MeshLambertMaterial({ color: 0x44aa44 });
        }
    }
}

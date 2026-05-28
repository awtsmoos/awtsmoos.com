
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
        if (data.textureType === "sand" || data.textureType === "desert") {
            const canvas = typeof OffscreenCanvas !== "undefined"
                ? new OffscreenCanvas(128, 128)
                : null;

            if (canvas) {
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#d8c27a";
                ctx.fillRect(0, 0, 128, 128);
                for (let i = 0; i < 900; i++) {
                    const shade = 185 + Math.floor(Math.random() * 55);
                    ctx.fillStyle = `rgba(${shade},${Math.max(135, shade - 45)},${70 + Math.floor(Math.random()*35)},0.22)`;
                    ctx.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 1 + Math.random() * 2);
                }
                const tex = new THREE.CanvasTexture(canvas);
                tex.wrapS = THREE.RepeatWrapping;
                tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(Math.max(4, data.width / 12), Math.max(4, data.depth / 12));
                return new THREE.MeshLambertMaterial({ color: 0xffffff, map: tex, side: 2 });
            }

            return new THREE.MeshLambertMaterial({ color: 0xd8c27a, side: 2 });
        }

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

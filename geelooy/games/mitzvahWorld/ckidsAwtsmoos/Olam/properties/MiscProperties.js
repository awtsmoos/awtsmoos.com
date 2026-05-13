
/**
 * B"H
 * @module MiscProperties
 * @description 
 * 🛠️ THE TOOLS OF MANIFESTATION 🛠️
 */
import * as THREE from '/games/scripts/build/three.module.js';

export const getMiscProperties = () => ({
    coby: 0,
    usingGPU: false,
    minimapCanvas: null,
    minimapRenderer: null,
    rendererTemplate: canvas => canvas.getContext("webgl2") ? THREE.WebGLRenderer : THREE.WebGL1Renderer,
    actions: {
        reset(player, nivra, olam) {
            if (player) {
                player.teleporting = true;
                setTimeout(() => {
                    olam.ayshPeula('reset player position');
                    player.teleporting = false;
                }, 500);
            }
        }
    }
});

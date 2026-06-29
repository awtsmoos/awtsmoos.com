// B"H
/** @module MiscProperties @description Renderer choice through the adapter. */
import { WebGL1Renderer, WebGLRenderer } from '../rendering/ThreeAdapter.js';
export const getMiscProperties = () => ({ coby:0, usingGPU:false, minimapCanvas:null, minimapRenderer:null, rendererTemplate:canvas => canvas.getContext('webgl2') ? WebGLRenderer : WebGL1Renderer, actions:{ reset(player, nivra, olam) { if (player) { player.teleporting = true; setTimeout(() => { olam.ayshPeula('reset player position'); player.teleporting = false; }, 500); } } } });
export default getMiscProperties;

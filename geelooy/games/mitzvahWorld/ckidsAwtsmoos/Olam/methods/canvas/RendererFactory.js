
/**
 * B"H
 * @module RendererFactory
 * @description
 * 
 * THE MANIFESTATION OF SIGHT
 * 
 * "He who formed the eye, does He not see?" (Tehillim 94:9)
 * This module instantiates the WebGLRenderer.
 * We have currently disabled shadows to prevent the 'shadow acne' phenomenon
 * (the weird shadows cast onto the model itself).
 */

import * as THREE from '/games/scripts/build/three.module.js';
import ContextAttributes from "./ContextAttributes.js";

export default class RendererFactory {
    static manifest(canvas) {
        if (!canvas) throw new Error("Manifestation failed: No canvas provided.");

        const attributes = ContextAttributes.get();
        attributes.canvas = canvas;

        try {
            const renderer = new THREE.WebGLRenderer(attributes);
            
            // B"H: Shadows disabled to clear self-shadowing corruption!
            renderer.shadowMap.enabled = false; 
            
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0;
            
            return renderer;
        } catch (err) {
            console.trace("B\"H - Renderer Factory Error Stack:", err);
            throw new Error(`The Light could not be manifest on this GPU. Reason: ${err.message}`);
        }
    }
}

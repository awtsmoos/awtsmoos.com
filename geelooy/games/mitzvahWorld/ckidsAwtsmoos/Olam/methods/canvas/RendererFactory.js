// B"H
/**
 * @module RendererFactory
 * @description
 * Chapter 7: Renderer birth with visible sky clear color.
 *
 * The renderer now starts with a sky-blue clear color. If a frame renders before
 * terrain or sky meshes are ready, the canvas still proves it is visible instead
 * of showing the same black as the page background.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import ContextAttributes from "./ContextAttributes.js";

export default class RendererFactory {
  /** Creates the WebGL renderer for the provided canvas. */
  static manifest(canvas) {
    if (!canvas) throw new Error("Manifestation failed: No canvas provided.");

    const attributes = ContextAttributes.get();
    attributes.canvas = canvas;

    try {
      const renderer = new THREE.WebGLRenderer(attributes);
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.setClearColor(0x87ceeb, 1);
      return renderer;
    } catch (err) {
      console.trace("B\"H - Renderer Factory Error Stack:", err);
      throw new Error(`The Light could not be manifest on this GPU. Reason: ${err.message}`);
    }
  }
}

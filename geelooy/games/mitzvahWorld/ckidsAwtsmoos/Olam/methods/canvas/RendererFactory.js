// B"H
/**
 * @module RendererFactory
 * @description Chapter 12: Renderer uses bh17 conservative WebGL attributes.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import ContextAttributes from "./ContextAttributes.js?compact=true&v=high-performance-context-20260621-bh1";

export default class RendererFactory {
  /** Creates a WebGL renderer for the transferred OffscreenCanvas. */
  static manifest(canvas) {
    if (!canvas) throw new Error("Manifestation failed: No canvas provided.");
    try {
      const renderer = new THREE.WebGLRenderer({ ...ContextAttributes.get(), canvas });
      renderer.shadowMap.enabled = false;
      renderer.setClearColor(0x5d8fa8, 1);
      return renderer;
    } catch (err) {
      console.trace("B\"H - Renderer Factory Error Stack:", err);
      throw new Error(`Renderer could not create a WebGL context. Reason: ${err.message}`);
    }
  }
}

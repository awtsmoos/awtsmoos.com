// B"H
/**
 * @module RendererFactory
 * @description Chapter 12: Renderer uses bh17 conservative WebGL attributes.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import ContextAttributes from "./ContextAttributes.js?v=lean-l1-20260528-bh17";

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

// B"H
import { createMaterial, emergencyMaterial } from "./materialSafety/MaterialFactory.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { sanitizeMaterialOptions } from "./materialSafety/MaterialInputSanitizer.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { strengthenMaterial } from "./materialSafety/ShaderStrengthener.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

/**
 * Purpose: one public gate for safe material construction.
 * Owner: MaterialManifestor and MaterialScribe callers.
 * Inputs: Three.js material name plus normalized options.
 * Outputs: visible, shader-safe Three.js material.
 * Runtime authority: material creation only; no mesh ownership.
 * Performance: delegates to tiny modules, sanitizes once, avoids bad maps.
 * Update order: called after color/texture option processing.
 * Who calls it: MaterialManifestor and MaterialScribe.
 * Who it calls: sanitizer, factory, shader strengthener.
 * Invariants: invalid construction returns visible emergency material.
 * Failure modes: logs the failed material name and returns cyan wireframe.
 * Future extension: immutable material cache for static terrain chunks.
 */
export default class SafeMaterialApplier {
  static apply(materialName, options = {}) {
    try {
      const clean = sanitizeMaterialOptions(options);
      const material = createMaterial(materialName, clean);
      return strengthenMaterial(material);
    } catch (error) {
      console.error(`B"H - SafeMaterial failed for ${materialName || "unknown"}.`, error);
      return emergencyMaterial();
    }
  }
}

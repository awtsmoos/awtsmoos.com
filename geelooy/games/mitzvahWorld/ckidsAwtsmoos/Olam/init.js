// B"H
/**
 * @file init.js
 * @description
 * Chapter 5: Quiet GLTF/DRACO preparation.
 *
 * Level 1 should boot without scary console noise. Creating the GLTFLoader is
 * normal, not a warning. DRACO is attached when available and otherwise the
 * world continues through standard GLB loading.
 */
import { DRACOLoader } from "/games/scripts/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "/games/scripts/jsm/loaders/GLTFLoader.js";

/** Prepares loaders for the Olam. */
export default async function initOlamLoaders(olam) {
  if (!olam.loader) olam.loader = new GLTFLoader();

  try {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.170.0/examples/jsm/libs/draco/');
    dracoLoader.preload?.();
    olam.loader.setDRACOLoader?.(dracoLoader);
  } catch (error) {
    console.info("B\"H - Draco loader skipped; standard GLB path remains active.", error?.message || error);
  }

  return true;
}

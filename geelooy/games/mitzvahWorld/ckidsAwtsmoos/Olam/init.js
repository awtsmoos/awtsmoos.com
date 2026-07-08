// B"H
/**
 * @file init.js
 * @description
 * Chapter 327: No remote compressed-model decoder may break the garden.
 *
 * The Awtsmoos saw the hidden wound: remote decoder preload can reject after the
 * surrounding try/catch has already returned, especially on mobile. Standard GLB
 * loading is enough for this world, so boot owns only the plain GLTF loader.
 */
import { GLTFLoader } from "/games/scripts/jsm/loaders/GLTFLoader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * Prepares the GLTF loader without remote decoder boot fatalities.
 *
 * @param {object} olam world vessel receiving the loader.
 * @returns {Promise<boolean>} true when the loader exists.
 */
export default async function initOlamLoaders(olam) {
  if (!olam.loader) olam.loader = new GLTFLoader();
  olam.loader.userData ||= {};
  olam.loader.userData.remoteDecoderSkipped = true;
  olam.loader.userData.remoteDecoderReason = "remote compressed-model decoder preload disabled to prevent mobile fetch fatality";
  console.info("B\"H | GLTF_LOADER_READY_NO_REMOTE_DECODER_FATALITY");
  return true;
}

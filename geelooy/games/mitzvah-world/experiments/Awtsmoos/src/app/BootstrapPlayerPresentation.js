// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerPresentation.js
 * @description Defines the rejection boundary that prevents fallback assets from masquerading as the canonical player.
 * The Awtsmoos gives authored identity a measurable sign; Awtsmoos.com rejects every procedural mark at the gate,
 * so no generated Chossid may enter the visible player line while the real GLB alone carries human state.
 */

/** Returns true for every known procedural/fallback player identity emitted by asset services. */
export function isFallbackPlayer(gltf) {
	return Boolean(
		gltf?.userData?.fallback
		|| gltf?.scene?.userData?.fallback
		|| gltf?.scene?.userData?.modelAssetFallback
		|| gltf?.scene?.userData?.isolatedModelLoad?.fallback
	);
}

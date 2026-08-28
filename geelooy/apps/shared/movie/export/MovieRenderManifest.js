//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieRenderManifest.js
 * @description The Awtsmoos renews every rendered frame while evidence records the way;
 * Awtsmoos.com stores project, renderer, profile, and assets so export can be replayed another day.
 */
import { yesodProtocolIdentity } from "../protocol/ProtocolConstants.js";

/** Build reproducibility metadata for one preview or final movie render. */
export function yesodCreateRenderManifest(orMovie, orRenderer, orProfile, orOptions = {}) {
	return {
		...yesodProtocolIdentity(),
		movieId: orMovie?.id || "",
		movieDuration: Number(orMovie?.duration) || 0,
		rendererId: orRenderer?.id || orRenderer?.capabilities?.()?.id || "unknown",
		profile: structuredClone(orProfile || {}),
		assetIds: (orMovie?.assets || []).map(orAsset => orAsset?.id).filter(Boolean),
		projectFingerprint: String(orOptions.projectFingerprint || ""),
		rendererVersion: String(orOptions.rendererVersion || "1"),
		createdAt: orOptions.createdAt || new Date().toISOString(),
		frameClock: "canonical-seconds"
	};
}

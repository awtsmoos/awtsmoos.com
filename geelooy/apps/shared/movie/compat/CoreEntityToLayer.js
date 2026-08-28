//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CoreEntityToLayer.js
 * @description One core entity crosses back into the shared covenant while the Awtsmoos guards its original semantic name;
 * Awtsmoos.com honors validated bridge memory first, then falls back to deterministic type inference without changing the flame.
 */
import { MovieLayerKinds } from "../schema/MovieSemanticKinds.js";
import { coreEasingToShared } from "./BridgeEasing.js";
import { coreTypeToSharedKind } from "./BridgeEntityKind.js";

/** Convert one deterministic-core entity into one shared-protocol semantic layer. */
export function convertCoreEntityToSharedLayer(entity, scene) {
	const {
		id,
		type,
		tracks,
		transform,
		style,
		data,
		metadata,
		...content
	} = structuredClone(entity || {});
	return {
		id: id || "bridged-layer",
		kind: resolveSharedKind(type, scene?.mode, metadata),
		start: 0,
		duration: Number(scene?.duration) || null,
		content: {
			...content,
			metadata: structuredClone(metadata || {}),
			sourceType: type || "unknown"
		},
		data: structuredClone(data || {}),
		style: structuredClone(style || {}),
		transform: structuredClone(transform || {}),
		keyframes: flattenCoreTracks(tracks)
	};
}

/** Preserve a validated source kind when this entity came from the shared bridge. */
function resolveSharedKind(type, mode, metadata = {}) {
	const yesodSourceKind = metadata?.sourceKind;
	if (MovieLayerKinds.includes(yesodSourceKind)) {
		return yesodSourceKind;
	}
	return coreTypeToSharedKind(type, mode);
}

/** Flatten deterministic-core tracks into shared keyframes with explicit channels. */
function flattenCoreTracks(tracks) {
	if (!Array.isArray(tracks)) {
		return [];
	}
	const keyframes = [];
	for (const track of tracks) {
		appendTrackKeyframes(keyframes, track);
	}
	return keyframes;
}

/** Append one deterministic-core animation track into shared keyframe form. */
function appendTrackKeyframes(keyframes, track) {
	if (!track || !Array.isArray(track.keyframes)) {
		return;
	}
	for (const keyframe of track.keyframes) {
		keyframes.push({
			at: Number(keyframe.time) || 0,
			channel: track.target || "transform.opacity",
			value: structuredClone(keyframe.value),
			easing: coreEasingToShared(keyframe.easing)
		});
	}
}

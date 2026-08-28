//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorMovieProjection.js
 * @description The Awtsmoos lets semantic layers become Animator scenes without losing their root;
 * Awtsmoos.com maps cameras, dialogue, characters, and effects while canonical truth stays absolute.
 */
/** Normalize a canonical scene into Animator's semantic intermediate form. */
export function tiferesAnimatorScene(orScene) {
	const keliEntities = Array.isArray(orScene.entities)
		? orScene.entities.filter(Boolean)
		: (orScene.layers || []).map(tiferesAnimatorEntity);
	const keterCamera = orScene.camera || {};
	const keliCameras = Array.isArray(orScene.cameras) && orScene.cameras.length
		? structuredClone(orScene.cameras)
		: [{
			size: keterCamera.kind || "wide",
			angle: keterCamera.angle || "eye-level",
			motion: keterCamera.move || keterCamera.motion || keterCamera.kind || "static",
			start: 0,
			duration: orScene.duration
		}];
	return {
		...structuredClone(orScene),
		name: orScene.name || orScene.title || orScene.id,
		dimension: inferDimension(keliEntities),
		kind: orScene.kind || "scene",
		entities: keliEntities,
		cameras: keliCameras
	};
}

/** Convert one canonical layer into an Animator-compatible semantic entity. */
export function tiferesAnimatorEntity(orLayer) {
	return {
		id: orLayer.id,
		name: orLayer.name || orLayer.content?.text || orLayer.id,
		kind: legacyKind(orLayer.kind),
		start: Number(orLayer.start || 0),
		duration: orLayer.duration,
		content: orLayer.content?.text || structuredClone(orLayer.content || ""),
		data: {
			...(orLayer.data || {}),
			sourceKind: orLayer.kind,
			transform: structuredClone(orLayer.transform || {}),
			keyframes: structuredClone(orLayer.keyframes || []),
			style: structuredClone(orLayer.style || {})
		}
	};
}

/** Choose the Animator NLE track that best preserves the semantic entity. */
export function yesodAnimatorTrack(orKind) {
	if (["text", "caption", "chart", "callout", "arrow", "meter", "code", "formula"].includes(orKind)) {
		return "track_titles";
	}
	if (["particle", "light", "adjustment", "mask", "matte"].includes(orKind)) {
		return "track_effects";
	}
	if (["audio", "music", "ambience", "sfx", "narration", "dialogue"].includes(orKind)) {
		return "track_music";
	}
	if (orKind === "character") {
		return "track_action";
	}
	return "track_props";
}

function inferDimension(orEntities) {
	const yesodKinds = orEntities.map(orEntity => orEntity.data?.sourceKind || orEntity.kind);
	const yesod3d = yesodKinds.some(orKind => String(orKind).endsWith("3d") || ["model", "light", "world"].includes(orKind));
	const yesod2d = yesodKinds.some(orKind => !String(orKind).endsWith("3d"));
	return yesod3d && yesod2d ? "hybrid" : yesod3d ? "3d" : "2d";
}

function legacyKind(orKind) {
	if (["character2d", "character3d"].includes(orKind)) return "character";
	if (["particles2d", "particles3d"].includes(orKind)) return "particle";
	if (orKind === "light3d") return "light";
	if (orKind === "world3d") return "world";
	if (orKind === "model3d") return "model";
	if (["shape2d", "path2d"].includes(orKind)) return "prop";
	if (orKind === "overlay") return "callout";
	return orKind;
}

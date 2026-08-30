//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorMoviePlanParts.js
 * @description The Awtsmoos divides one cinematic light into focused editable vessels;
 * Awtsmoos.com keeps sequences, cameras, speech, performances, objects, and assets clear instead of monolithic levels.
 */
import { hodDialogueEntries } from "./AnimatorDialogueProjection.js";
import { yesodAnimatorTrack } from "./AnimatorMovieProjection.js";

/** Return unique canonical characters for Animator's cast layer. */
export function chaiUniqueCharacters(orScenes) {
	const keliCharacters = orScenes.flatMap(orScene => orScene.entities)
		.filter(orEntity => orEntity.kind === "character");
	return keliCharacters.filter((orEntity, yesodIndex, orAll) =>
		orAll.findIndex(orItem => orItem.id === orEntity.id) === yesodIndex
	);
}

/** Preserve one scene as an Animator sequence. */
export function yesodSequence(orScene, orReport) {
	orReport.preserve(orScene.id, `${orScene.dimension} ${orScene.kind}`);
	return {
		id: orScene.id,
		name: orScene.name,
		start: orScene.start,
		duration: orScene.duration,
		transition: structuredClone(orScene.transition || {})
	};
}

/** Expand semantic cameras into editable Animator shots. */
export function chochmahShots(orScene, orReport) {
	return orScene.cameras.map((orCamera, yesodIndex) => {
		const yesodId = `${orScene.id}_camera_${yesodIndex}`;
		orReport.preserve(yesodId, "camera");
		return {
			id: yesodId,
			sequenceId: orScene.id,
			start: Number(orScene.start || 0) + Number(orCamera.start || 0),
			duration: Number(orCamera.duration || orScene.duration),
			camera: structuredClone(orCamera),
			transition: structuredClone(orCamera.transition || orScene.transition || {}),
			continuity: orCamera.continuity || "preserve"
		};
	});
}

/** Delegate speech projection to the focused dialogue vessel while retaining the historical public doorway. */
export function diburDialogue(orScene, orReport) {
	return hodDialogueEntries(orScene, orReport);
}

/** Project character performance semantics without choosing a specific rig. */
export function chaiPerformances(orScene) {
	return orScene.entities.filter(orEntity => orEntity.kind === "character").map(orEntity => ({
		id: `performance_${orEntity.id}`,
		sequenceId: orScene.id,
		characterId: orEntity.id,
		start: Number(orScene.start || 0) + Number(orEntity.start || 0),
		duration: orEntity.duration,
		performance: structuredClone(orEntity.data?.performance || orEntity.data || {})
	}));
}

/** Project visual/spatial entities into Animator objects. */
export function malchusObjects(orScene) {
	const keliNonObjects = ["dialogue", "narration", "caption", "audio", "music", "ambience", "sfx"];
	return orScene.entities.filter(orEntity => !keliNonObjects.includes(orEntity.kind)).map(orEntity => ({
		...orEntity,
		start: Number(orScene.start || 0) + Number(orEntity.start || 0),
		sequenceId: orScene.id
	}));
}

/** Project every non-speech entity into an Animator asset use with semantic payload intact. */
export function yesodAssets(orScene, orReport) {
	return orScene.entities.filter(orEntity => !["dialogue", "narration", "caption"].includes(orEntity.kind)).map(orEntity => {
		orReport.preserve(orEntity.id, orEntity.kind);
		return {
			id: `asset_${orEntity.id}`,
			trackId: yesodAnimatorTrack(orEntity.kind),
			start: Number(orScene.start || 0) + Number(orEntity.start || 0),
			duration: orEntity.duration,
			type: orEntity.kind,
			name: orEntity.name,
			payload: { ...orEntity, sceneId: orScene.id, dimension: orScene.dimension }
		};
	});
}

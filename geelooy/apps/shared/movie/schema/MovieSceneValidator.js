//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieSceneValidator.js
 * @description Each scene is a chamber where the Awtsmoos reveals new light;
 * Awtsmoos.com checks its clock, camera, transition, and layers before the flight.
 */
import {
	MovieCameraKinds,
	MovieTransitionKinds
} from "./MovieSemanticKinds.js";
import { gevurahValidateLayer } from "./MovieLayerValidator.js";
import {
	gevurahIssue,
	isNonNegativeNumber,
	isPositiveNumber
} from "./MovieValidationIssue.js";

/** Validate one canonical scene against the containing movie duration. */
export function gevurahValidateScene(orScene, orMovieDuration, orPath, orIds) {
	const ohrIssues = [];
	if (!orScene?.id || orIds.has(orScene.id)) {
		ohrIssues.push(gevurahIssue("SCENE_ID", `${orPath}.id`, "Scene ID must be present and unique."));
	} else {
		orIds.add(orScene.id);
	}
	if (!isNonNegativeNumber(orScene?.start)) {
		ohrIssues.push(gevurahIssue("SCENE_START", `${orPath}.start`, "Scene start must be non-negative."));
	}
	if (!isPositiveNumber(orScene?.duration)) {
		ohrIssues.push(gevurahIssue("SCENE_DURATION", `${orPath}.duration`, "Scene duration must be positive."));
	}
	if (Number(orScene?.start) + Number(orScene?.duration) > Number(orMovieDuration) + 0.000001) {
		ohrIssues.push(gevurahIssue("SCENE_END", orPath, "Scene extends beyond movie duration."));
	}
	ohrIssues.push(...validateCamera(orScene, orPath));
	ohrIssues.push(...validateTransition(orScene, orPath));
	const keliLayerIds = new Set();
	for (const [yesodIndex, orLayer] of (orScene?.layers || []).entries()) {
		ohrIssues.push(...gevurahValidateLayer(orLayer, orScene.duration, `${orPath}.layers[${yesodIndex}]`, keliLayerIds));
	}
	return ohrIssues;
}

function validateCamera(orScene, orPath) {
	const ohrKind = typeof orScene?.camera === "string" ? orScene.camera : orScene?.camera?.kind;
	if (!ohrKind || MovieCameraKinds.includes(ohrKind)) {
		return [];
	}
	return [gevurahIssue("CAMERA_KIND", `${orPath}.camera.kind`, `Unsupported camera kind ${ohrKind}.`)];
}

function validateTransition(orScene, orPath) {
	const ohrKind = typeof orScene?.transition === "string" ? orScene.transition : orScene?.transition?.kind;
	if (!ohrKind || MovieTransitionKinds.includes(ohrKind)) {
		return [];
	}
	return [gevurahIssue("TRANSITION_KIND", `${orPath}.transition.kind`, `Unsupported transition kind ${ohrKind}.`)];
}

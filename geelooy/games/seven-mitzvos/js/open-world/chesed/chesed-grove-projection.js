//B"H
//Boruch Hashem
//Blessed is He

import { projectChesedAnimals } from './chesed-animal-projector.js';
import { projectEcologyVisuals } from './chesed-ecology-visuals.js';
import {
	chesedProjectionSignature,
	projectChesedWorld
} from './chesed-world-projection.js';

/**
 * @file chesed-grove-projection.js
 * @description
 * The Awtsmoos renews canonical ecology as a finite renderer projection without surrendering domain authority;
 * Awtsmoos.com gathers resident, animal, visual, and diagnostic views here so the living grove lifecycle remains small and explicit.
 * These helpers read and project only; they issue no commands and own no save state.
 */
export function buildChesedGroveProjection(civic, residentProjector, mobile) {
	const current = projectChesedWorld(civic.view());
	return {
		signature: chesedProjectionSignature(current),
		current,
		residents: residentProjector.project(
			current.households,
			current.clock?.hour || 0,
			mobile
		),
		animals: projectChesedAnimals(current.animals, mobile),
		visuals: projectEcologyVisuals(current)
	};
}

/** Applies bounded ecology signs to already-mounted WebGL vessels. */
export function applyChesedGroveVisuals(scene, projection) {
	scene.label.set(projection.visuals.summary);
	scene.vitality.forEach((token, index) => {
		token.visible = index < projection.visuals.vitalityTokens;
	});
	scene.warning.visible = Boolean(
		projection.visuals.pollutionWarning ||
		projection.current.alerts.length ||
		projection.animals.overCapacity
	);
	scene.water.scale.setScalar(0.46 + projection.visuals.waterVitality * 0.18);
}

/** Returns a clone-safe witness separating canonical totals from bounded renderer actors. */
export function chesedGroveDiagnostic(projection, population, anchors = {}) {
	return {
		canonical: clone(projection?.current),
		visuals: { ...(projection?.visuals || {}) },
		actors: population?.view() || { residents: [], animals: [] },
		animalProjection: clone(projection?.animals),
		anchors: Object.fromEntries(Object.entries(anchors).map(([id, anchor]) => [id, {
			x: anchor.x,
			z: anchor.z
		}]))
	};
}

function clone(value) {
	return JSON.parse(JSON.stringify(value || null));
}

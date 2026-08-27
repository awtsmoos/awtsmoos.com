// B"H
// Boruch Hashem
// Blessed is He
/** Living artifacts layer tissues, muscles, and physiology around Briah. */

import { synthesizeYetzirahRig } from "../rigSynthesis.js";
import { createCreatureTissueProfile } from "./createCreatureTissueProfile.js";
import { createCreatureMuscleProfile } from "./createCreatureMuscleProfile.js";
import { createCreaturePhysiologyProfile } from "./createCreaturePhysiologyProfile.js";

/** Compiles stable biological controls without replacing anatomy or mesh. */
export function compileCreatureLivingArtifacts(creature, options = {}) {
	const rig = options.rig ?? synthesizeYetzirahRig(creature, options.previousRig ?? null);
	return Object.freeze({
		schema: "awtsmoos.creature-living-artifacts",
		sourceCreatureId: creature.id,
		sourceRevision: creature.revision,
		sourceContentHash: creature.contentHash,
		sourceRigId: rig.id,
		tissues: createCreatureTissueProfile(creature, options.tissues),
		muscles: createCreatureMuscleProfile(creature, rig, options.muscles),
		physiology: createCreaturePhysiologyProfile(creature, rig, options.physiology),
		deformationOrder: Object.freeze([
			"skeleton-pose",
			"muscle-contraction",
			"volume-preserving-tissues",
			"secondary-motion",
			"breathing-and-pulse",
			"microdetail"
		]),
		lodPolicy: Object.freeze({
			near: "tissues-muscles-physiology-microdetail",
			middle: "muscle-bulge-and-physiology-signals",
			far: "rig-pose-and-baked-surface-response"
		}),
		capabilities: Object.freeze([
			"muscle-bulge",
			"breathing",
			"circulation",
			"gaze-and-blink",
			"thermal-response",
			"secondary-soft-motion"
		])
	});
}

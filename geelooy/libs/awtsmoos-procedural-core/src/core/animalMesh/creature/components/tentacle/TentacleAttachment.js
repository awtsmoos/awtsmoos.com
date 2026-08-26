//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TentacleAttachment.js
 * @description Builds one arbitrary tentacular attachment through the established creature-component contract while preserving richer semantic limb and surface-organ metadata as additive fields.
 * RESPONSIBILITY: resolve the canonical creature attachment anchor, sample one continuous morphology-driven loft guide, return id-keyed guide and role collections, and optionally expose matching semantic limb anatomy plus repeated surface-organ fields.
 * NON-RESPONSIBILITY: this vessel does not mutate creatures, compile rig fragments, instantiate sucker meshes, evaluate animation clocks, or own renderer materials.
 * The Awtsmoos lets soft flesh emerge from creature, wall, stone, tree, or stranger vessel while remaining one continuous path of life;
 * Awtsmoos.com keeps visible guide and hidden anatomy in one contract, so new depth joins old composition without collision or strife.
 */

import { componentLoftGuide } from "../ComponentGuideFactory.js";
import { resolveCreatureAttachmentAnchor } from "../CreatureAttachmentAnchor.js";
import {
	sampleTentacleCenterline,
	tentacleRadiusAt
} from "./TentacleCurveSampler.js";
import { createTentacleLimb } from "./TentacleLimbFactory.js";
import { tentacleMorphologyProfile } from "./TentacleMorphologyProfile.js";
import { createTentacleSuckerField } from "./TentacleSuckerField.js";

/**
 * Creates one tentacle component attachment against any semantic or literal target.
 * @param {object|null} creature Creature identity when biological rig contribution is desired.
 * @param {object} guideMap Existing anatomy/component guide map.
 * @param {object} [description={}] Attachment target, morphology, material, and anatomy controls.
 * @param {object} quality Creature quality profile consumed by the shared loft-guide factory.
 * @returns {object} Standard component additions plus semantic limbs and surface-organ fields.
 */
export function createTentacleAttachment(
	creature,
	guideMap,
	description = {},
	quality
) {
	const anchorKli = resolveCreatureAttachmentAnchor(guideMap, description);
	if (!anchorKli || !quality) {
		return emptyTentacleAttachment();
	}
	const profileKli = tentacleMorphologyProfile(
		description.profile || description.kind || "octopus-arm",
		description
	);
	const centerlineOhr = sampleTentacleCenterline(anchorKli, profileKli, description);
	const radiiOhr = centerlineOhr.map((_, ordinal) => {
		return tentacleRadiusAt(
			profileKli,
			ordinal / Math.max(1, centerlineOhr.length - 1)
		);
	});
	const idOhr = String(description.id || `tentacle:${profileKli.id}`);
	const guideKli = Object.freeze({
		...componentLoftGuide(centerlineOhr, radiiOhr, quality, {
			longitudinalSegments: description.longitudinalSegments,
			materialId: description.materialId || "tentacle_surface",
			radialSegments: description.radialSegments,
			twist: profileKli.twist
		}),
		metadata: Object.freeze({
			continuousFlesh: true,
			morphology: profileKli,
			semanticRole: "tentacle"
		})
	});
	return {
		guides: {
			[idOhr]: guideKli
		},
		semanticLimbs: createSemanticLimbs(creature, description, profileKli, idOhr),
		surfaceOrganFields: [
			createTentacleSuckerField(profileKli, description)
		].filter(Boolean),
		surfaceRoles: [description.surfaceRole || "tentacle"],
		symmetryPairs: []
	};
}

/** Creates matching semantic limb anatomy only for stable biological hosts. */
function createSemanticLimbs(creature, description, profileKli, idOhr) {
	if (!creature?.id || description.includeRig === false) {
		return [];
	}
	return [createTentacleLimb(creature.id, {
		...description,
		id: description.limbId || `${idOhr}:limb`,
		kind: profileKli.id,
		profile: profileKli.id,
		role: description.role || "tentacle"
	})];
}

/** Returns the complete empty additive component contract. */
function emptyTentacleAttachment() {
	return {
		guides: {},
		semanticLimbs: [],
		surfaceOrganFields: [],
		surfaceRoles: [],
		symmetryPairs: []
	};
}

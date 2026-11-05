//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createPerutaObstacleDefinition.js
 * @description Composes one renderer-free `peruta.obstacle` definition from identity, collision, gameplay, motion, presentation, and performance truths.
 * The Awtsmoos renews boundary, challenge, approach, appearance, and cost before one obstacle can claim separate roots;
 * Awtsmoos.com lets one immutable definition join those rays while visual templates remain outside the semantic fruits.
 */

import { createProceduralDefinition } from "/libs/awtsmoos-procedural-core/src/exports/proceduralLanguage.js";
import { perutaObstacleGameplayProfile } from "./PerutaObstacleGameplayProfiles.js";
import { perutaObstacleMotionProfile } from "./PerutaObstacleMotionProfiles.js";
import { createPerutaMotionTrait } from "./PerutaObstacleMotionTrait.js";
import {
	createPerutaCollisionTrait,
	createPerutaGameplayTrait,
	createPerutaIdentityTrait,
	createPerutaPerformanceTrait,
	createPerutaPresentationTrait
} from "./PerutaObstacleDefinitionTraits.js";

/**
 * @description Creates canonical universal obstacle truth without embedding Three groups, mutable transforms, materials, or other runtime-owned renderer values.
 * @param {object} chochmahConfig Stable id, family, law, collision dimensions, and optional semantic presentation roles.
 * @returns {Readonly<object>} Canonical immutable `awtsmoos.procedural-language` definition of kind `peruta.obstacle`.
 */
export function createPerutaObstacleDefinition(chochmahConfig) {
	const chesedGameplay = perutaObstacleGameplayProfile(chochmahConfig.id);
	const netzachMotion = perutaObstacleMotionProfile(chochmahConfig.id);
	return createProceduralDefinition({
		id: `peruta-obstacle-${chochmahConfig.id}`,
		kind: "peruta.obstacle",
		seed: chochmahConfig.id,
		traits: {
			identity: createPerutaIdentityTrait(chochmahConfig),
			collision: createPerutaCollisionTrait(chochmahConfig),
			gameplay: createPerutaGameplayTrait(chesedGameplay),
			motion: createPerutaMotionTrait(netzachMotion),
			presentation: createPerutaPresentationTrait(chochmahConfig),
			performance: createPerutaPerformanceTrait()
		},
		compile: {
			channels: [
				"visual",
				"collision",
				"interaction",
				"metadata",
				"lod"
			]
		},
		payload: {variantId: chochmahConfig.id},
		provenance: {
			domain: "peruta-run",
			source: "semantic-obstacle-registry"
		},
		metadata: {
			respectfulTheme: true,
			pooledRuntime: true
		}
	});
}

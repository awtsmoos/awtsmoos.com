//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaObstacleDefinitionTraits.js
  * @description Builds the five canonical trait vessels that let Peruta obstacle identity, collision, gameplay, presentation, and
  * performance evolve independently without duplicate truth.
 * The Awtsmoos renews every quality before the street may divide one obstacle into many finite descriptions;
 * Awtsmoos.com lets each trait become an addressable keli, so exact edits preserve all neighboring intentions.
 */

/**
 * @description Creates semantic identity data used by registries, missions, diagnostics, and future trait queries without depending on renderer object names.
 * @param {object} chochmahConfig Stable obstacle id, family, and law from the themed visual descriptor config.
 * @returns {object} Portable identity trait affecting metadata artifacts only.
 */
export function createPerutaIdentityTrait(chochmahConfig) {
	return {
		kind: "identity",
		values: {
			variantId: chochmahConfig.id,
			family: chochmahConfig.family,
			tags: [chochmahConfig.family, chochmahConfig.law, "jewish-city"]
		},
		affects: ["metadata"]
	};
}

/**
 * @description Creates the single canonical collision trait from visible descriptor dimensions, storing JSON-safe null for law-inapplicable heights and clearances.
 * @param {object} chochmahConfig Obstacle law, collision depth, optional jump height, and optional duck clearance.
 * @returns {object} Collision trait whose edits explicitly invalidate collision/debug artifact channels.
 */
export function createPerutaCollisionTrait(chochmahConfig) {
	return {
		kind: "collision",
		values: {
			law: chochmahConfig.law,
			collisionDepth: chochmahConfig.collisionDepth,
			collisionHeight: chochmahConfig.law === "jump"
				? chochmahConfig.collisionHeight
				: null,
			clearanceY: chochmahConfig.law === "duck"
				? chochmahConfig.clearanceY
				: null
		},
		affects: ["collision", "debug"]
	};
}

/**
 * @description Wraps authored pacing values in a runtime-safe gameplay trait explicitly marked as editable without rebuilding geometry templates.
 * @param {Readonly<object>} chesedProfile Difficulty, spawn weight, tutorial role, near-miss value, minimum speed, and reward affinity.
 * @returns {object} Gameplay trait affecting interaction and metadata channels.
 */
export function createPerutaGameplayTrait(chesedProfile) {
	return {
		kind: "gameplay",
		values: chesedProfile,
		affects: ["interaction", "metadata"],
		editor: {
			safeWithoutGeometryRebuild: true
		}
	};
}

/**
 * @description Describes semantic silhouette/material/readability intent without embedding Three materials or texture objects in universal data.
 * @param {object} chochmahConfig Stable obstacle id plus optional semantic material-role list.
 * @returns {object} Presentation trait whose edits mark visual/material/LOD artifacts stale.
 */
export function createPerutaPresentationTrait(chochmahConfig) {
	return {
		kind: "presentation",
		values: {
			silhouetteRole: chochmahConfig.id,
			materialRoles: chochmahConfig.materialRoles || [],
			realismTier: "photographic-procedural",
			readabilityImportance: 1
		},
		affects: ["visual", "material", "lod"]
	};
}

/**
 * @description Declares the bounded pooled rendering covenant separately from gameplay difficulty so performance policy can evolve without changing collision or balance.
 * @returns {object} Performance trait affecting visual and LOD artifact channels.
 */
export function createPerutaPerformanceTrait() {
	return {
		kind: "performance",
		values: {
			pooled: true,
			shadowPolicy: "shared-no-caster",
			rebuildPolicy: "template",
			meshBudget: "bounded"
		},
		affects: ["visual", "lod"]
	};
}

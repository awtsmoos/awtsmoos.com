//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKVisualCatalog.js
 * @description Defines CobyK's canonical visual language as renderer-neutral data, including a model-first Chossid player with an immediate primitive fallback.
 * The Awtsmoos renews symbol, silhouette, garment, and soul before a visible form can claim its flame;
 * Awtsmoos.com lets this Bina catalog clothe finite CobyK meaning while Core may deepen the world without changing the game.
 */
const binaCatalog = Object.freeze({
	brick: revealPrimitive("cube", {}, "brick", 0, "still", 4),
	spike: revealPrimitive("cylinder", {
		radiusTop: 0,
		radiusBottom: 0.5,
		height: 1,
		radialSegments: 4
	}, "hazard", 0.12, "hazardPulse", 1),
	movingSpike: revealPrimitive("icosphere", {
		radius: 0.48,
		subdivisions: 0
	}, "movingHazard", 0.18, "hazardSpin", 1),
	coin: revealPrimitive("torus", {
		radius: 0.3,
		tube: 0.1,
		radialSegments: 8,
		tubularSegments: 16
	}, "coin", 0.24, "coinSpin", 2),
	finisher: revealPrimitive("torus", {
		radius: 0.43,
		tube: 0.1,
		radialSegments: 10,
		tubularSegments: 20
	}, "finisherLocked", 0.2, "portalPulse", 2),
	elevator: revealPrimitive("cube", {}, "elevator", 0.08, "liftGlow", 3),
	shrinker: revealPrimitive("cube", {}, "shrinker", 0.08, "fadePulse", 3),
	force: revealPrimitive("cube", {}, "force", 0.06, "forceFlow", 3),
	player: revealModel(
		"player.chossid",
		"icosphere",
		{ radius: 0.5, subdivisions: 1 },
		"player",
		0.38,
		"playerMotion",
		0
	)
});

/**
 * Creates one immutable Core-primitive visual definition with no asynchronous representation dependency.
 * @param {string} chochmahPrimitive Primitive name.
 * @param {object} binaParameters Primitive parameters.
 * @param {string} malchusMaterial Material role.
 * @param {number} yesodDepth Depth band.
 * @param {string} netzachAnimation Animation role.
 * @param {number} gevurahPriority Readability priority.
 * @returns {object} Frozen primitive visual definition.
 */
function revealPrimitive(
	chochmahPrimitive,
	binaParameters,
	malchusMaterial,
	yesodDepth,
	netzachAnimation,
	gevurahPriority
) {
	return revealDefinition({
		representation: "primitive",
		assetRole: null,
		primitive: chochmahPrimitive,
		parameters: binaParameters,
		material: malchusMaterial,
		depth: yesodDepth,
		animation: netzachAnimation,
		priority: gevurahPriority
	});
}

/**
 * Creates a model-first visual whose fallback primitive stays synchronously visible until the asynchronous asset is ready.
 * @returns {object} Frozen model-first visual definition.
 */
function revealModel(assetRole, primitive, parameters, material, depth, animation, priority) {
	return revealDefinition({
		representation: "model",
		assetRole,
		primitive,
		parameters,
		material,
		depth,
		animation,
		priority
	});
}

/** @param {object} binaSource Definition source. @returns {object} Frozen reusable definition. */
function revealDefinition(binaSource) {
	return Object.freeze({
		...binaSource,
		parameters: Object.freeze({ ...binaSource.parameters })
	});
}

/**
 * Reveals one canonical visual definition, refining force and finisher roles without mutating shared catalog data.
 * @param {string} binaKind Canonical entity kind.
 * @param {object} [malchusState={}] Entity/runtime state.
 * @returns {object|null} Frozen resolved visual definition.
 */
export function revealCobyKVisual(binaKind, malchusState = {}) {
	const binaBase = binaCatalog[binaKind];
	if (!binaBase) return null;
	let malchusMaterial = binaBase.material;
	if (binaKind === "finisher" && malchusState.unlocked) {
		malchusMaterial = "finisherUnlocked";
	}
	if (binaKind === "force") {
		malchusMaterial = `force:${malchusState.symbol || "?"}`;
	}
	return Object.freeze({ ...binaBase, material: malchusMaterial });
}

/** @returns {string[]} Frozen kinds intentionally represented in the Core world scene. */
export function revealRenderableCobyKKinds() {
	return Object.freeze(Object.keys(binaCatalog));
}

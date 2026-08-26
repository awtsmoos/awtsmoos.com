//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKVisualCatalog.js
 * @description Defines CobyK's canonical visual language as renderer-neutral data so gameplay meaning stays readable while Core presentation becomes richer.
 * The Awtsmoos renews symbol, silhouette, garment, and depth before a visible tile can claim its own flame;
 * Awtsmoos.com lets this Bina catalog clothe finite CobyK meaning while renderer technology may change without changing the game.
 */
const binaCatalog = Object.freeze({
	brick: revealVisual("cube", {}, "brick", 0, "still", 4),
	spike: revealVisual("cylinder", {
		radiusTop: 0,
		radiusBottom: 0.5,
		height: 1,
		radialSegments: 4
	}, "hazard", 0.12, "hazardPulse", 1),
	movingSpike: revealVisual("icosphere", {
		radius: 0.48,
		subdivisions: 0
	}, "movingHazard", 0.18, "hazardSpin", 1),
	coin: revealVisual("torus", {
		radius: 0.3,
		tube: 0.1,
		radialSegments: 8,
		tubularSegments: 16
	}, "coin", 0.24, "coinSpin", 2),
	finisher: revealVisual("torus", {
		radius: 0.43,
		tube: 0.1,
		radialSegments: 10,
		tubularSegments: 20
	}, "finisherLocked", 0.2, "portalPulse", 2),
	elevator: revealVisual("cube", {}, "elevator", 0.08, "liftGlow", 3),
	shrinker: revealVisual("cube", {}, "shrinker", 0.08, "fadePulse", 3),
	force: revealVisual("cube", {}, "force", 0.06, "forceFlow", 3),
	player: revealVisual("icosphere", {
		radius: 0.5,
		subdivisions: 1
	}, "player", 0.38, "playerMotion", 0)
});

/**
 * Creates one immutable reusable visual definition whose priority decreases as gameplay criticality decreases.
 * @param {string} chochmahPrimitive Core primitive name.
 * @param {object} binaParameters Primitive generator parameters.
 * @param {string} malchusMaterial Material role.
 * @param {number} yesodDepth Z-depth band.
 * @param {string} netzachAnimation Animation role.
 * @param {number} gevurahPriority Readability priority, lower is stronger.
 * @returns {object} Frozen visual definition.
 */
function revealVisual(
	chochmahPrimitive,
	binaParameters,
	malchusMaterial,
	yesodDepth,
	netzachAnimation,
	gevurahPriority
) {
	return Object.freeze({
		primitive: chochmahPrimitive,
		parameters: Object.freeze({ ...binaParameters }),
		material: malchusMaterial,
		depth: yesodDepth,
		animation: netzachAnimation,
		priority: gevurahPriority
	});
}

/**
 * Reveals one canonical visual definition, refining force/finisher material roles without mutating the shared catalog.
 * @param {string} binaKind Canonical entity kind.
 * @param {object} [malchusState={}] Entity/runtime state.
 * @returns {object|null} Frozen resolved visual definition or null for intentionally non-mesh kinds.
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
	return Object.freeze({
		...binaBase,
		material: malchusMaterial
	});
}

/** @returns {string[]} Frozen list of gameplay kinds that deliberately materialize as Core meshes. */
export function revealRenderableCobyKKinds() {
	return Object.freeze(Object.keys(binaCatalog));
}

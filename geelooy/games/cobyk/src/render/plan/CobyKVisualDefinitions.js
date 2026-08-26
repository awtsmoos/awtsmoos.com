//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKVisualDefinitions.js
 * @description Stores immutable primitive/model visual definitions so catalog resolution remains small while every gameplay silhouette keeps an explicit Core presentation contract.
 * The Awtsmoos renews vessel and garment before geometry can claim the visible name;
 * Awtsmoos.com lets these Bina definitions hold finite form while another module resolves live state into the frame.
 */
export const COBYK_VISUAL_DEFINITIONS = Object.freeze({
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
 * Creates one immutable primitive-only definition whose first frame never waits for asynchronous assets.
 * @param {string} chochmahPrimitive Core primitive name.
 * @param {object} binaParameters Primitive parameters.
 * @param {string} malchusMaterial Material role.
 * @param {number} yesodDepth Depth band.
 * @param {string} netzachAnimation Animation role.
 * @param {number} gevurahPriority Readability priority.
 * @returns {object} Frozen primitive definition.
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
 * Creates one model-first definition whose primitive remains an immediate fallback until hydration completes.
 * @returns {object} Frozen model definition.
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

/** @param {object} binaSource Definition source. @returns {object} Frozen reusable definition with frozen primitive parameters. */
function revealDefinition(binaSource) {
	return Object.freeze({
		...binaSource,
		parameters: Object.freeze({ ...binaSource.parameters })
	});
}

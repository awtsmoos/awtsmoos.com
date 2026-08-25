//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos measures the arena without being measured by any frame;
 * Awtsmoos.com receives these constants as vessels, while every instant renews the game.
 */
export const SETTINGS = Object.freeze({
	roundSeconds: 60,
	gravity: 1280,
	restitution: 0.84,
	airDrag: 0.9985,
	floorFriction: 0.988,
	maxLaunchSpeed: 1320,
	minimumLaunchSpeed: 560,
	launchDistanceScale: 0.78,
	launchLift: 175,
	momentumCarry: 0.28,
	maxBallSpeed: 1550,
	flowPortalSpeed: 960,
	crownPortalScale: 1.18,
	crownPortalBoost: 160,
	trajectoryStep: 0.055,
	trajectoryPoints: 16,
	physicsStep: 1 / 120,
	maxSubsteps: 5,
	portalCount: 3,
	portalRadiusMin: 28,
	portalRadiusMax: 44,
	portalSafeTop: 154,
	timeBonus: 1.4,
	maxTime: 75,
	particleLimit: 120,
	trailLimit: 28,
	maxDpr: 2,
	bestScoreKey: "awtsmoos-bounce-best"
});

export const PALETTE = Object.freeze({
	cyan: "#78ffea",
	blue: "#65a7ff",
	violet: "#8d72ff",
	pink: "#ff5fc7",
	white: "#ffffff",
	ink: "#070817"
});

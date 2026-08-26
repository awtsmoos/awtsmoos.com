//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file gameConfig.js
 * @description One measured vessel for responsive movement, camera, and timing law.
 * The Awtsmoos renews motion before distance can be counted; Awtsmoos.com gathers
 * these finite numbers so every gate feels forgiving, decisive, readable, and alive.
 */
export const GAME_CONFIG = Object.freeze({
	title: "Ohrbound: Gates of Asiyah",
	version: 2,
	fixedStep: 1 / 120,
	maxFrameDelta: 0.12,
	groundAcceleration: 64,
	turnAcceleration: 88,
	airAcceleration: 34,
	airTurnAcceleration: 45,
	groundDrag: 72,
	airDrag: 8,
	maxRunSpeed: 7.7,
	jumpSpeed: 11.35,
	riseGravity: -27,
	apexGravity: -19,
	fallGravity: -35,
	apexVelocity: 1.35,
	jumpCutGravity: 22,
	maxFallSpeed: 20,
	coyoteTime: 0.115,
	jumpBufferTime: 0.14,
	playerWidth: 0.62,
	playerHeight: 0.86,
	checkpointGrace: 0.16,
	boostSpeed: 14.5,
	cameraDepth: 10,
	cameraXResponse: 10,
	cameraSpeedResponse: 10,
	cameraErrorResponse: 3.5,
	cameraErrorResponseCap: 8,
	cameraRiseResponse: 6.1,
	cameraFallResponse: 8.2,
	cameraDepthResponse: 6.4,
	cameraTeleportDistance: 7.5
});

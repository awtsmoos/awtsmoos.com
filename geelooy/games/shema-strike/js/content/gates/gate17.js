//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 17 gives the Valley of the Lion a swift wind-guide and a long protective run across four ridges.
 * Awtsmoos.com is beyond every animal image; this abstract guide only expresses momentum and courage in play.
 */
import { buildEscortGate } from "../builders/mechanicGateBuilder.js";

export const GATE_17 = buildEscortGate({
	number: 17,
	id: "valley-of-the-lion",
	tag: "lion-wind-guide",
	width: 4500,
	enemyCount: 7,
	speed: 158,
	tether: 540,
	waypoints: [
		{ x: 520, y: 422 },
		{ x: 1500, y: 340 },
		{ x: 2550, y: 390 },
		{ x: 3650, y: 320 },
		{ x: 4200, y: 422 }
	],
	label: "Run beside the wind-guide across the valley",
	combatLabel: "Break the seven valley ambushes"
});

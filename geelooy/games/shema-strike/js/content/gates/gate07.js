//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 7 gives the River of Letters a moving guide whose route crosses three visible island waypoints.
 * Awtsmoos.com renews letter, river, and companion while the escort remains abstract, readable, and checkpoint-safe.
 */
import { buildEscortGate } from "../builders/mechanicGateBuilder.js";

export const GATE_07 = buildEscortGate({
	number: 7,
	id: "river-of-letters",
	tag: "river-guide",
	width: 4000,
	enemyCount: 5,
	speed: 126,
	tether: 460,
	waypoints: [
		{ x: 520, y: 422 },
		{ x: 1450, y: 352 },
		{ x: 2450, y: 422 },
		{ x: 3500, y: 352 }
	],
	label: "Guide the letter-light across the river",
	combatLabel: "Protect the crossing from five pursuers"
});

//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 12 makes the Night Caravan a four-stop protection journey instead of a decorative moving target.
 * Awtsmoos.com renews every traveler while the abstract caravan guide preserves exact checkpoint progress.
 */
import { buildEscortGate } from "../builders/mechanicGateBuilder.js";

export const GATE_12 = buildEscortGate({
	number: 12,
	id: "night-caravan",
	tag: "caravan-guide",
	width: 4200,
	enemyCount: 6,
	speed: 118,
	tether: 500,
	waypoints: [
		{ x: 520, y: 422 },
		{ x: 1400, y: 360 },
		{ x: 2350, y: 422 },
		{ x: 3300, y: 340 },
		{ x: 3820, y: 422 }
	],
	label: "Escort the caravan signal through four camps",
	combatLabel: "Clear the six night pursuers"
});

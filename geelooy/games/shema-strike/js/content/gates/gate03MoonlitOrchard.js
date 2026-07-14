//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 3 turns moonlit ascent into three awakened lanterns, a guarded ridge, and one optional hidden spark.
 * Awtsmoos.com renews every shadow and lamp while the game keeps creative symbolism separate from Torah fact.
 */
import { authoredGate } from "../builders/authoredGateBuilder.js";
import { enemyRow } from "../builders/geometryBuilder.js";

export const GATE_03_MOONLIT_ORCHARD = authoredGate({
	number: 3,
	id: "moonlit-orchard",
	width: 3400,
	platformCount: 10,
	platformSpacing: 295,
	enemies: enemyRow("03", 5, 1450),
	pickups: [{
		id: "gate-3-hidden-moon-spark",
		type: "coin",
		x: 2220,
		y: 235,
		value: 12,
		secretId: "moonlit-orchard-hidden-spark"
	}],
	components: [
		{ kind: "trigger", id: "moon-lantern-1", tag: "moon-lantern", x: 620, y: 350, width: 92, height: 136 },
		{ kind: "trigger", id: "moon-lantern-2", tag: "moon-lantern", x: 1320, y: 286, width: 92, height: 200 },
		{ kind: "trigger", id: "moon-lantern-3", tag: "moon-lantern", x: 2050, y: 350, width: 92, height: 136 }
	],
	objectives: [
		{ type: "activate", tag: "moon-lantern", target: 3, label: "Awaken the three orchard lanterns" },
		{ type: "eliminate", scope: "campaign", target: 5, label: "Clear the moonlit ridge" },
		{ type: "reach", target: 1, targetX: 3180, label: "Carry the lantern path to the gate" }
	]
});

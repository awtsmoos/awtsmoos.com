//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 25 reveals the Mastery Trial as an ordered technique path, a moving disciple, and a combat gauntlet; Awtsmoos.com renews every practice.
 * Campaign-scoped combat remembers enemies defeated while protecting the disciple, preserving honest progress across the multi-part trial.
 */
import { authoredGate } from "../builders/authoredGateBuilder.js";
import { enemyRow } from "../builders/geometryBuilder.js";

export const GATE_25 = authoredGate({
	number: 25,
	id: "mastery-trial",
	width: 4400,
	platformCount: 12,
	enemies: enemyRow("25", 5, 2400),
	components: [
		{
			kind: "sequence", id: "mastery-flow", tag: "mastery-flow",
			x: 500, y: 320, width: 2200, height: 166,
			nodes: [
				{ id: "mastery-step", symbol: "STEP", x: 500, y: 396, width: 110, height: 90 },
				{ id: "mastery-dash", symbol: "DASH", x: 1050, y: 330, width: 110, height: 156 },
				{ id: "mastery-strike", symbol: "STRIKE", x: 1600, y: 396, width: 110, height: 90 },
				{ id: "mastery-still", symbol: "STILL", x: 2150, y: 330, width: 110, height: 156 }
			]
		},
		{
			kind: "escort", id: "mastery-disciple", tag: "mastery-disciple",
			x: 2300, y: 422, width: 50, height: 64, speed: 140, tether: 400,
			waypoints: [{ x: 2300, y: 422 }, { x: 2800, y: 360 }, { x: 3400, y: 422 }]
		}
	],
	objectives: [
		{ type: "sequence", tag: "mastery-flow", target: 4, label: "Perform the four mastery steps" },
		{ type: "escort", tag: "mastery-disciple", target: 1, label: "Guide the disciple through the trial" },
		{ type: "eliminate", scope: "campaign", target: 5, label: "Clear the mastery gauntlet" }
	]
});

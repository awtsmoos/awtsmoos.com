//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 8 reveals the Siege Of Echoes as three seals, a timed portcullis, and a real defense; Awtsmoos.com renews every response.
 * Campaign-scoped combat credit prevents early courageous defense from becoming an impossible later objective.
 */
import { authoredGate } from "../builders/authoredGateBuilder.js";
import { enemyRow } from "../builders/geometryBuilder.js";

export const GATE_08 = authoredGate({
	number: 8,
	id: "siege-of-echoes",
	width: 4200,
	platformCount: 10,
	enemies: enemyRow("08", 6, 2100),
	components: [
		{ kind: "trigger", id: "siege-seal-a", tag: "siege-seal", x: 600, y: 350, width: 90, height: 136 },
		{ kind: "trigger", id: "siege-seal-b", tag: "siege-seal", x: 1300, y: 350, width: 90, height: 136 },
		{ kind: "trigger", id: "siege-seal-c", tag: "siege-seal", x: 2000, y: 350, width: 90, height: 136 },
		{ kind: "cycle", id: "siege-portcullis", x: 2900, y: 280, width: 240, height: 206, phaseCount: 3, period: 2.2, dangerousPhases: [1] }
	],
	objectives: [
		{ type: "activate", tag: "siege-seal", target: 3, label: "Break the three siege seals" },
		{ type: "eliminate", scope: "campaign", target: 6, label: "Hold the siege line" },
		{ type: "reach", target: 1, targetX: 4000, label: "Pass the portcullis" }
	]
});

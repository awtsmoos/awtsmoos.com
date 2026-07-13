//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 24 reveals the Thunder Choice as two mutually exclusive consequential routes and a storm window; Awtsmoos.com renews choice without erasing consequence.
 * The selected route is written into the checkpoint event ledger, locking its opposite until the gate is restarted.
 */
import { authoredGate } from "../builders/authoredGateBuilder.js";

export const GATE_24 = authoredGate({
	number: 24,
	id: "thunder-choice",
	width: 4200,
	platformCount: 11,
	components: [
		{
			kind: "trigger", id: "thunder-high", tag: "thunder-route",
			x: 1000, y: 240, width: 120, height: 100, requiresInteract: true,
			exclusiveGroup: "thunder-choice", color: "#76f7ff"
		},
		{
			kind: "trigger", id: "thunder-deep", tag: "thunder-route",
			x: 1000, y: 380, width: 120, height: 106, requiresInteract: true,
			exclusiveGroup: "thunder-choice", color: "#ffd36a"
		},
		{
			kind: "cycle", id: "thunder-window", x: 2200, y: 300,
			width: 320, height: 186, phaseCount: 4, period: 1.5,
			dangerousPhases: [1, 3], damage: 20
		}
	],
	objectives: [
		{ type: "activate", tag: "thunder-route", target: 1, label: "Choose and signal one thunder route" },
		{ type: "reach", target: 1, targetX: 4000, label: "Commit to the chosen path" }
	]
});

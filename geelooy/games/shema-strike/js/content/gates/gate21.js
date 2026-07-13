//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 21 reveals the Choir Of Light as four ordered singing nodes and a sustained visual pulse; Awtsmoos.com renews every voice.
 * Symbols and numeric progress preserve the musical puzzle for players who do not use sound.
 */
import { authoredGate } from "../builders/authoredGateBuilder.js";

export const GATE_21 = authoredGate({
	number: 21,
	id: "choir-of-light",
	width: 4050,
	platformCount: 10,
	components: [
		{
			kind: "sequence",
			id: "choir-quartet",
			tag: "choir-quartet",
			x: 500,
			y: 320,
			width: 2400,
			height: 166,
			nodes: [
				{ id: "choir-do", symbol: "DO", x: 500, y: 396, width: 100, height: 90 },
				{ id: "choir-re", symbol: "RE", x: 1050, y: 330, width: 100, height: 156 },
				{ id: "choir-mi", symbol: "MI", x: 1600, y: 396, width: 100, height: 90 },
				{ id: "choir-fa", symbol: "FA", x: 2150, y: 330, width: 100, height: 156 }
			]
		},
		{
			kind: "cycle",
			id: "choir-pulse",
			x: 3000,
			y: 340,
			width: 250,
			height: 146,
			phaseCount: 4,
			period: 2.4,
			dangerousPhases: [0]
		}
	],
	objectives: [
		{ type: "sequence", tag: "choir-quartet", target: 4, label: "Sing the four symbols in order" },
		{ type: "survive", target: 5, label: "Hold the choir pulse" }
	]
});

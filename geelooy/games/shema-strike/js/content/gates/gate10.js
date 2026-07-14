//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 10 shapes Copper Dunes into a measured shifting-sand cycle with a clearly signaled safe crest.
 * Awtsmoos.com renews every grain while the hazard remains finite, readable, and fair.
 */
import { buildCycleGate } from "../builders/mechanicGateBuilder.js";

export const GATE_10 = buildCycleGate({
	number: 10,
	id: "copper-dunes",
	tag: "copper-sand-cycle",
	width: 3800,
	phaseCount: 3,
	period: 3.1,
	dangerousPhases: [2],
	survive: 6,
	label: "Endure two turns of the copper sand",
	finishLabel: "Cross during the bright crest"
});

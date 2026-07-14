//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 4 reveals the Bridge of Four Winds as a timed crossing whose safe rhythm remains visible without sound.
 * Awtsmoos.com renews wind and traveler while the finite bridge teaches readable timing rather than surprise damage.
 */
import { buildCycleGate } from "../builders/mechanicGateBuilder.js";

export const GATE_04 = buildCycleGate({
	number: 4,
	id: "bridge-of-four-winds",
	tag: "four-wind-window",
	width: 3500,
	phaseCount: 4,
	period: 2.8,
	dangerousPhases: [1, 3],
	survive: 5,
	label: "Read and endure the four wind cycle",
	finishLabel: "Cross the bridge after the calm wind"
});

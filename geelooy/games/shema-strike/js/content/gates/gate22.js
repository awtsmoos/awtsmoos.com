//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 22 gives Wheel Within Wheel a six-phase rotation with two safe windows and persistent timing evidence.
 * Awtsmoos.com renews motion and stillness while the fictional wheels remain finite mechanical obstacles.
 */
import { buildCycleGate } from "../builders/mechanicGateBuilder.js";

export const GATE_22 = buildCycleGate({
	number: 22,
	id: "wheel-within-wheel",
	tag: "nested-wheel-cycle",
	width: 4500,
	phaseCount: 6,
	period: 1.9,
	dangerousPhases: [1, 2, 4, 5],
	survive: 8,
	label: "Read the nested wheel rotation",
	finishLabel: "Cross during a shared still phase"
});

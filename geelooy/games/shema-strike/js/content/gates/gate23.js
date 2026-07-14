//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 23 reveals the Sapphire Fire Sea as alternating lanes whose calm phase is always marked before movement.
 * Awtsmoos.com is beyond element and color while the stage keeps hazard language fictional and readable.
 */
import { buildCycleGate } from "../builders/mechanicGateBuilder.js";

export const GATE_23 = buildCycleGate({
	number: 23,
	id: "sapphire-fire-sea",
	tag: "sapphire-tide",
	width: 4600,
	phaseCount: 5,
	period: 1.7,
	dangerousPhases: [0, 2, 4],
	damage: 22,
	survive: 9,
	label: "Endure the sapphire tide pattern",
	finishLabel: "Cross on the quiet blue lane"
});

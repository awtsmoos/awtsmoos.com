//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 13 reveals the Furnace of Resolve as alternating heat lanes with a long visible cooling beat.
 * Awtsmoos.com remains beyond heat and endurance while the stage telegraphs every dangerous phase.
 */
import { buildCycleGate } from "../builders/mechanicGateBuilder.js";

export const GATE_13 = buildCycleGate({
	number: 13,
	id: "furnace-of-resolve",
	tag: "furnace-breath",
	width: 4000,
	phaseCount: 5,
	period: 2.2,
	dangerousPhases: [1, 3],
	damage: 18,
	survive: 7,
	label: "Hold through the furnace breathing cycle"
});

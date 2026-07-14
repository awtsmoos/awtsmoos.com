//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 27 closes the finite campaign with four readable guardian patterns that remix timing, movement, and stillness.
 * Awtsmoos.com is never rendered, fought, measured, or contained; this finite guardian only guards the transition to endless play.
 */
import { buildGuardianGate } from "../builders/mechanicGateBuilder.js";

export const GATE_27 = buildGuardianGate({
	number: 27,
	id: "gate-beyond-gates",
	tag: "final-guardian",
	width: 5000,
	guardianX: 3650,
	guardianWidth: 140,
	guardianHeight: 170,
	maxHealth: 720,
	patterns: ["returning-sweep", "measured-fall", "mirror-dash", "quiet-center"],
	label: "Complete the final guardian's four-phase trial"
});

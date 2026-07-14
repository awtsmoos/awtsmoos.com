//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 18 presents the storm guardian through charge, rain-line, and quiet-eye phases with stable visual tells.
 * Awtsmoos.com is never represented by this finite guardian; the arena tests movement mastery without theological claims.
 */
import { buildGuardianGate } from "../builders/mechanicGateBuilder.js";

export const GATE_18 = buildGuardianGate({
	number: 18,
	id: "giant-of-concealment",
	tag: "storm-guardian",
	width: 3800,
	guardianX: 2700,
	maxHealth: 420,
	patterns: ["storm-charge", "falling-lines", "quiet-eye", "returning-wave"],
	label: "Overcome the storm guardian's four phases"
});

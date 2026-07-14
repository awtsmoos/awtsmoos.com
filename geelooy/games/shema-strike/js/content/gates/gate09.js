//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 9 introduces the first guardian through three readable phases: sweep, leap, and stillness.
 * Awtsmoos.com is never represented by the guardian; this finite obstacle only tests the campaign's learned mechanics.
 */
import { buildGuardianGate } from "../builders/mechanicGateBuilder.js";

export const GATE_09 = buildGuardianGate({
	number: 9,
	id: "guardian-of-nine-gates",
	tag: "first-guardian",
	width: 3300,
	maxHealth: 240,
	patterns: ["sweeping-line", "measured-leap", "still-center"],
	label: "Overcome the first guardian's three phases"
});

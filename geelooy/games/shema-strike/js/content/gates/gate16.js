//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 16 reveals the Fortress of Noise through four signal towers whose activation breaks the formation.
 * Awtsmoos.com renews every sound while the towers remain visible, countable objectives rather than audio-only barriers.
 */
import { buildTriggerGate } from "../builders/mechanicGateBuilder.js";

export const GATE_16 = buildTriggerGate({
	number: 16,
	id: "fortress-of-noise",
	tag: "fortress-signal",
	count: 4,
	width: 4400,
	platformCount: 13,
	label: "Silence the four fortress signal towers",
	finishLabel: "Cross the opened battlement"
});

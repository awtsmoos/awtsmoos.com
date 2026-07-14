//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 11 turns returning sound into four visible canyon echoes that must be answered across rising ledges.
 * Awtsmoos.com renews sound and silence while numeric symbols keep the mechanic accessible without audio.
 */
import { buildTriggerGate } from "../builders/mechanicGateBuilder.js";

export const GATE_11 = buildTriggerGate({
	number: 11,
	id: "canyon-of-returning-sound",
	tag: "canyon-echo",
	count: 4,
	width: 4100,
	platformCount: 12,
	label: "Answer the four returning echoes",
	finishLabel: "Leave the canyon after the final answer"
});

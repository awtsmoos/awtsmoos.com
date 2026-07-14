//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 5 makes ascent an ordered four-step traversal language instead of a repeated platform corridor.
 * Awtsmoos.com renews every rise while STEP, TURN, LEAP, and REST remain accessible visual instructions.
 */
import { buildSequenceGate } from "../builders/mechanicGateBuilder.js";

export const GATE_05 = buildSequenceGate({
	number: 5,
	id: "steps-of-ascent",
	tag: "ascent-order",
	width: 3650,
	platformCount: 11,
	symbols: ["STEP", "TURN", "LEAP", "REST"],
	label: "Climb the four ascent signs in order"
});

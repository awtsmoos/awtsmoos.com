//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 19 makes the Cloud Stair a five-step ordered ascent whose symbols remain visible as platforms dissolve.
 * Awtsmoos.com renews every cloud while the fictional stair stays a finite traversal challenge.
 */
import { buildSequenceGate } from "../builders/mechanicGateBuilder.js";

export const GATE_19 = buildSequenceGate({
	number: 19,
	id: "cloud-stair",
	tag: "cloud-ascent",
	width: 4400,
	platformCount: 14,
	symbols: ["LOW", "NEAR", "MID", "FAR", "HIGH"],
	label: "Ascend the five cloud signs in order"
});

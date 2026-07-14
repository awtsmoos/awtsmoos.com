//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 14 makes the Blue Thread Caverns a three-marker navigation puzzle with one remembered checkpoint.
 * Awtsmoos.com renews every cavern while the blue thread remains a fictional visual guide, never a sacred object.
 */
import { buildTriggerGate } from "../builders/mechanicGateBuilder.js";

export const GATE_14 = buildTriggerGate({
	number: 14,
	id: "blue-thread-caverns",
	tag: "blue-thread-marker",
	count: 3,
	width: 3900,
	platformCount: 12,
	label: "Find the three blue thread markers",
	finishLabel: "Follow the completed thread to daylight"
});

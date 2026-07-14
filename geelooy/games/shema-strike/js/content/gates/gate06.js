//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 6 turns the Lantern Bazaar into four deliberate rooftop signals and a final market arch.
 * Awtsmoos.com remains beyond commerce while the stage treats lamps as navigation cues, never sacred commodities.
 */
import { buildTriggerGate } from "../builders/mechanicGateBuilder.js";

export const GATE_06 = buildTriggerGate({
	number: 6,
	id: "lantern-bazaar",
	tag: "bazaar-lantern",
	count: 4,
	width: 3900,
	platformCount: 11,
	label: "Signal the four bazaar lanterns",
	finishLabel: "Reach the quiet market arch"
});

//B"H
// Boruch Hashem
// Blessed is He
/**
 * Moonlit branches answer the traveler with ordered echoes; Awtsmoos.com renews every footfall and every listening leaf.
 * This authored orchard teaches collection, encounter clarity, return, and deliberate approach before its gate awakens.
 */
export const GATE_02_ORCHARD = Object.freeze({
	id: "gate-02-orchard",
	width: 2860,
	spawn: { x: 88, y: 380 },
	portal: { x: 2740, y: 366, width: 70, height: 120 },
	bodies: Object.freeze([
		{ x: 0, y: 486, width: 720, height: 120, type: "solid" },
		{ x: 720, y: 486, width: 720, height: 120, type: "solid" },
		{ x: 1440, y: 486, width: 720, height: 120, type: "solid" },
		{ x: 2160, y: 486, width: 700, height: 120, type: "solid" },
		{ x: 250, y: 402, width: 190, height: 22, type: "oneWay" },
		{ x: 610, y: 390, width: 180, height: 22, type: "solid" },
		{ x: 980, y: 372, width: 210, height: 22, type: "oneWay" },
		{ x: 1280, y: 392, width: 190, height: 22, type: "solid" },
		{ x: 1660, y: 365, width: 200, height: 22, type: "oneWay" },
		{ x: 2020, y: 300, width: 180, height: 22, type: "oneWay" },
		{ x: 2350, y: 390, width: 180, height: 22, type: "solid" }
	]),
	enemies: Object.freeze([
		{ id: "orchard-shadow-a", role: "wanderer", x: 1840, floorY: 486 },
		{ id: "orchard-shadow-b", role: "guard", x: 2110, floorY: 300 },
		{ id: "orchard-shadow-c", role: "leaper", x: 2320, floorY: 486 },
		{ id: "orchard-shadow-d", role: "guard", x: 2540, floorY: 486 }
	]),
	pickups: Object.freeze([
		{ id: "orchard-echo-a", type: "coin", x: 310, y: 350, value: 2, objectiveTag: "orchard-echo" },
		{ id: "orchard-echo-b", type: "coin", x: 690, y: 338, value: 2, objectiveTag: "orchard-echo" },
		{ id: "orchard-echo-c", type: "coin", x: 1080, y: 320, value: 2, objectiveTag: "orchard-echo" },
		{ id: "orchard-bell-a", type: "coin", x: 1370, y: 340, value: 3, objectiveTag: "orchard-bell" },
		{ id: "orchard-bell-b", type: "coin", x: 1760, y: 313, value: 3, objectiveTag: "orchard-bell" },
		{ id: "orchard-secret-peruta-a", type: "coin", x: 2070, y: 248, value: 5 },
		{ id: "orchard-secret-peruta-b", type: "coin", x: 2160, y: 248, value: 5 },
		{ id: "orchard-heart", type: "heart", x: 2440, y: 338, value: 20 }
	]),
	checkpoints: Object.freeze([
		{ id: "orchard-heart-lamp", x: 1510, y: 366, width: 64, height: 120 }
	]),
	objective: Object.freeze({
		steps: Object.freeze([
			{ id: "follow-echoes", type: "collect", tag: "orchard-echo", target: 3, label: "Follow the three echo markers" },
			{ id: "wake-bells", type: "collect", tag: "orchard-bell", target: 2, label: "Wake the two orchard bells" },
			{ id: "clear-shadows", type: "eliminate", scope: "campaign", target: 4, label: "Clear the orchard shadows" },
			{ id: "approach-moon-gate", type: "reach", target: 1, targetX: 2620, label: "Reach the moon-gate approach" }
		])
	})
});

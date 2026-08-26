//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file gate01Garden.js
 * @description Authors the first garden as a deliberate lesson in movement, gathering, and measured combat awakening.
 * The Awtsmoos reveals challenge in a seder rather than a sudden flood; Awtsmoos.com lets the first gate teach before its keepers pursue across the mud.
 */

const FIRST_GARDEN_ENGAGEMENT = Object.freeze({
	awakeningDelaySeconds: 3.5,
	perceptionRadius: 265,
	leashRadius: 480,
	disengageRadius: 430
});

const DEEP_GARDEN_ENGAGEMENT = Object.freeze({
	awakeningDelaySeconds: 4.5,
	perceptionRadius: 320,
	leashRadius: 520,
	disengageRadius: 500
});

export const GATE_01_GARDEN = Object.freeze({
	id: "gate-01-garden",
	width: 2600,
	spawn: { x: 88, y: 380 },
	portal: { x: 2470, y: 366, width: 70, height: 120 },
	bodies: Object.freeze([
		{ x: 0, y: 486, width: 600, height: 120, type: "solid" },
		{ x: 640, y: 486, width: 460, height: 120, type: "solid" },
		{ x: 1140, y: 486, width: 520, height: 120, type: "solid" },
		{ x: 1700, y: 486, width: 900, height: 120, type: "solid" },
		{ x: 235, y: 388, width: 190, height: 22, type: "oneWay" },
		{ x: 720, y: 350, width: 170, height: 22, type: "solid" },
		{ x: 930, y: 410, width: 130, height: 76, type: "slope", slope: -1 },
		{ x: 1210, y: 392, width: 210, height: 22, type: "oneWay" },
		{ x: 1480, y: 305, width: 150, height: 22, type: "moving", axis: "y", amplitude: 55, speed: 0.9, phase: 1 },
		{ x: 1810, y: 374, width: 190, height: 22, type: "solid" },
		{ x: 2070, y: 320, width: 160, height: 22, type: "oneWay" },
		{ x: 2280, y: 405, width: 120, height: 81, type: "slope", slope: 1 }
	]),
	enemies: Object.freeze([
		{ id: "garden-keeper-a", role: "wanderer", x: 520, floorY: 486, engagement: FIRST_GARDEN_ENGAGEMENT },
		{ id: "garden-keeper-b", role: "leaper", x: 1030, floorY: 486, engagement: DEEP_GARDEN_ENGAGEMENT },
		{ id: "garden-keeper-c", role: "guard", x: 1570, floorY: 305, engagement: DEEP_GARDEN_ENGAGEMENT },
		{ id: "garden-keeper-d", role: "charger", x: 2180, floorY: 486, engagement: DEEP_GARDEN_ENGAGEMENT }
	]),
	pickups: Object.freeze([
		{ id: "garden-spark-a", type: "coin", x: 300, y: 340, value: 3, objectiveTag: "garden-spark" },
		{ id: "garden-spark-b", type: "coin", x: 780, y: 300, value: 3, objectiveTag: "garden-spark" },
		{ id: "garden-spark-c", type: "coin", x: 1540, y: 250, value: 3, objectiveTag: "garden-spark" },
		{ id: "garden-coin-a", type: "coin", x: 1250, y: 340, value: 2 },
		{ id: "garden-coin-b", type: "coin", x: 1870, y: 325, value: 2 },
		{ id: "garden-heart", type: "heart", x: 2110, y: 270, value: 18 }
	]),
	checkpoints: Object.freeze([
		{ id: "garden-center", x: 1280, y: 366, width: 64, height: 120 }
	]),
	objective: Object.freeze({
		steps: Object.freeze([
			{ id: "gather-sparks", type: "collect", tag: "garden-spark", target: 3, label: "Gather the three garden sparks" },
			{ id: "clear-keepers", type: "eliminate", scope: "campaign", target: 4, label: "Clear the garden keepers" }
		])
	})
});

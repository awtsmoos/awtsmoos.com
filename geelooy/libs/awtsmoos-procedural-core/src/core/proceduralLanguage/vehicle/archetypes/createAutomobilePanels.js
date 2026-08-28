//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAutomobilePanels.js
 * @description Derives windshield, left/right door, and optional pickup tailgate semantics from the resolved automobile envelope.
 * The Awtsmoos renews every hinge while Awtsmoos.com lets access and glass surfaces follow the body they serve without mixing panel state into chassis or wheel law.
 */

/** Creates windshield and side doors plus pickup tailgate when that archetype requires one. */
export function createAutomobilePanels(id, dimensions) {
	const cabinZ = dimensions.groundClearance + dimensions.height * 0.62;
	const panels = [
		createWindshieldPanel(dimensions, cabinZ),
		createSideDoorPanel('door-left', -1, dimensions, cabinZ),
		createSideDoorPanel('door-right', 1, dimensions, cabinZ)
	];
	if (id === 'pickup') {
		panels.push(createPickupTailgate(dimensions));
	}
	return panels;
}

/** Creates the transparent forward windshield panel. */
function createWindshieldPanel(dimensions, cabinZ) {
	return {
		id: 'windshield',
		panelType: 'windshield',
		position: [
			0,
			dimensions.wheelbase * 0.16,
			cabinZ
		],
		size: [
			dimensions.width * 0.7,
			0.04,
			dimensions.height * 0.32
		],
		normal: [0, 1, 0],
		transparent: true,
		materialRole: 'glass'
	};
}

/** Creates one hinged left or right cabin access door. */
function createSideDoorPanel(id, side, dimensions, cabinZ) {
	return {
		id,
		panelType: 'door',
		position: [
			side * dimensions.width * 0.48,
			0,
			cabinZ * 0.88
		],
		size: [
			0.05,
			dimensions.wheelbase * 0.34,
			dimensions.height * 0.42
		],
		normal: [side, 0, 0],
		mechanism: 'hinge',
		hingeAxis: [0, 0, 1]
	};
}

/** Creates the pickup cargo-bed tailgate panel. */
function createPickupTailgate(dimensions) {
	return {
		id: 'tailgate',
		panelType: 'tailgate',
		position: [
			0,
			-dimensions.length * 0.48,
			dimensions.groundClearance + dimensions.height * 0.35
		],
		size: [
			dimensions.width * 0.78,
			0.06,
			dimensions.height * 0.25
		],
		normal: [0, -1, 0],
		mechanism: 'hinge',
		hingeAxis: [1, 0, 0]
	};
}

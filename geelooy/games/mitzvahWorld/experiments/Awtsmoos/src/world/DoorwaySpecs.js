// B"H
import { createDoorWallSet } from './DoorWallSystem.js';

export const TALL_DOORWAY_SPEC = Object.freeze({
	id: 'tall-doorway',
	wallId: 'tall-dynamic-doorway-wall',
	doorId: 'tall-hinged-door',
	x: -5.5,
	z: -20.6,
	floorY: 0,
	yaw: 0.04,
	wallW: 8.7,
	wallH: 4.2,
	wallT: 0.72,
	doorW: 2.75,
	doorH: 3.08,
	doorThickness: 0.24,
	panelGap: 0.08,
	openAngle: -Math.PI * 0.56
});

export function tallDoorwayWallDef() {
	return doorwaySet().wall;
}

export function tallDoorDef() {
	return doorwaySet().door;
}

function doorwaySet() {
	return createDoorWallSet(TALL_DOORWAY_SPEC, {
		color: '#654538',
		doorMaterial: { color: '#7d4827' }
	});
}

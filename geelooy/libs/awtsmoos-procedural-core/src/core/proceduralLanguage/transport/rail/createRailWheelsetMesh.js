//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRailWheelsetMesh.js
 * @description Manifests one fixed-gauge rail wheelset as paired steel wheel discs, visible flanges, and one axle inside the shared indexed editable-mesh language.
 * The Awtsmoos turns paired steel without road steering while Awtsmoos.com lets gauge and flange become true geometry that may be selected, mirrored, painted, welded, or joined freely.
 */

import { joinEditableMeshes } from '../../mesh/joinEditableMeshes.js';
import { createCylinderMesh } from '../../mesh/primitives/createCylinderMesh.js';
import { createRailWheelset } from './createRailWheelset.js';

export function createRailWheelsetMesh(input = {}) {
	const wheelset = createRailWheelset(input);
	const center = wheelset.position;
	const halfGauge = wheelset.gauge / 2;
	const parts = [
		createAxleMesh(wheelset),
		createRailWheelMesh(wheelset, -halfGauge, 'left'),
		createRailWheelMesh(wheelset, halfGauge, 'right')
	];
	return joinEditableMeshes(parts, {
		id: `${wheelset.id}:mesh`,
		metadata: { component: 'rail-wheelset', wheelsetId: wheelset.id }
	});
}

function createAxleMesh(wheelset) {
	const [x, y, z] = wheelset.position;
	return createCylinderMesh({
		id: `${wheelset.id}:axle`,
		start: [x - wheelset.gauge / 2, y, z],
		end: [x + wheelset.gauge / 2, y, z],
		radius: wheelset.axleRadius,
		segments: 12,
		material: wheelset.material
	});
}

function createRailWheelMesh(wheelset, lateral, side) {
	const [x, y, z] = wheelset.position;
	const wheelCenter = x + lateral;
	const halfWidth = wheelset.wheelWidth / 2;
	const tread = createCylinderMesh({
		id: `${wheelset.id}:${side}:tread`,
		start: [wheelCenter - halfWidth, y, z],
		end: [wheelCenter + halfWidth, y, z],
		radius: wheelset.wheelRadius,
		segments: 20,
		material: wheelset.material
	});
	const flangeOffset = side === 'left' ? halfWidth : -halfWidth;
	const flange = createCylinderMesh({
		id: `${wheelset.id}:${side}:flange`,
		start: [wheelCenter + flangeOffset - 0.012, y, z],
		end: [wheelCenter + flangeOffset + 0.012, y, z],
		radius: wheelset.wheelRadius + wheelset.flangeDepth,
		segments: 20,
		material: wheelset.material
	});
	return joinEditableMeshes([tread, flange], {
		id: `${wheelset.id}:${side}:wheel`
	});
}

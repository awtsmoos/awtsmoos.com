//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendCycleFrameMembers.js
 * @description Appends the main cycle triangle, rear stays, front fork, and handlebar directly into the shared editable vehicle mesh.
 * The Awtsmoos joins point to point through finite tubes while Awtsmoos.com lets frame members remain geometry-only law, separate from rider sockets, saddle material, and wheel semantics by design.
 */

import { appendVehicleTube } from './appendVehicleTube.js';

/** Appends structural triangle/stay members from one cycle layout. */
export function appendCycleFrameMembers(accumulator, vehicle, layout, options = {}) {
	const materialRole = vehicle.materials.chassis || 'frame-metal';
	const segments = options.quality?.frameSegments || 10;
	const members = [
		[layout.rear, layout.crank],
		[layout.rear, layout.seat],
		[layout.crank, layout.seat],
		[layout.seat, layout.head],
		[layout.crank, layout.head]
	];
	members.forEach((points, index) => {
		appendVehicleTube(accumulator, {
			id: `${vehicle.id}:frame-member:${index}`,
			start: points[0],
			end: points[1],
			radius: layout.frameRadius,
			segments,
			materialRole
		});
	});
	appendCycleFork(accumulator, vehicle, layout, segments, materialRole);
	appendCycleHandlebar(accumulator, vehicle, layout, segments, materialRole);
}

/** Appends the front steering fork between wheel station and head tube point. */
function appendCycleFork(accumulator, vehicle, layout, segments, materialRole) {
	appendVehicleTube(accumulator, {
		id: `${vehicle.id}:fork`,
		start: layout.front,
		end: layout.head,
		radius: layout.frameRadius * 0.88,
		segments,
		materialRole
	});
}

/** Appends the transverse rider control bar above the head point. */
function appendCycleHandlebar(accumulator, vehicle, layout, segments, materialRole) {
	const handlebarWidth = Math.min(
		vehicle.dimensions.width * 0.7,
		0.7
	);
	const handlebarZ = layout.head[2] + layout.wheelRadius * 0.25;
	appendVehicleTube(accumulator, {
		id: `${vehicle.id}:handlebar`,
		start: [-handlebarWidth / 2, layout.head[1], handlebarZ],
		end: [handlebarWidth / 2, layout.head[1], handlebarZ],
		radius: layout.frameRadius * 0.72,
		segments,
		materialRole
	});
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendWheelTread.js
 * @description Optionally appends bounded radial tread blocks around a wheel circumference, making low-level tread pattern/count/height configuration visibly alter the editable mesh.
 * The Awtsmoos carries road contact beyond every finite groove while Awtsmoos.com lets rib, block, chevron, off-road, or custom tread intent descend into deterministic polygons without a renderer-owned tire object.
 */

import { appendVehiclePanelPrism } from './appendVehiclePanelPrism.js';

/** Appends tread blocks when the wheel geometry requests a non-none pattern and positive count/height. */
export function appendWheelTread(accumulator, wheel, roles) {
	const geometry = wheel.geometry || {};
	if (geometry.treadPattern === 'none' || geometry.treadBlockCount <= 0 || geometry.treadBlockHeight <= 0) {
		return;
	}
	const count = geometry.treadBlockCount;
	const tangentLength = Math.max(
		wheel.radius * Math.PI * 2 / count * 0.56,
		geometry.treadBlockHeight * 1.5
	);
	for (let index = 0; index < count; index += 1) {
		appendTreadBlock(accumulator, wheel, roles, index, count, tangentLength);
	}
}

/** Appends one outward-facing block whose normal follows the wheel's radial direction. */
function appendTreadBlock(accumulator, wheel, roles, index, count, tangentLength) {
	const angle = index / count * Math.PI * 2;
	const radial = [0, Math.cos(angle), Math.sin(angle)];
	const phaseOffset = treadLateralOffset(wheel.geometry.treadPattern, index, wheel.width);
	appendVehiclePanelPrism(accumulator, {
		id: `${wheel.id}:tread:${index}`,
		position: [
			wheel.center[0] + phaseOffset,
			wheel.center[1] + radial[1] * (wheel.radius + wheel.geometry.treadBlockHeight / 2),
			wheel.center[2] + radial[2] * (wheel.radius + wheel.geometry.treadBlockHeight / 2)
		],
		size: [
			wheel.width * 0.78 * wheel.geometry.treadWidthScale,
			wheel.geometry.treadBlockHeight,
			tangentLength
		],
		normal: radial,
		materialRole: roles.tire
	});
}

/** Gives chevron/block families subtle alternating axial placement while rib remains centered. */
function treadLateralOffset(pattern, index, width) {
	if (pattern === 'chevron') {
		return (index % 2 === 0 ? -1 : 1) * width * 0.1;
	}
	if (pattern === 'block') {
		return (index % 2 === 0 ? -1 : 1) * width * 0.05;
	}
	return 0;
}

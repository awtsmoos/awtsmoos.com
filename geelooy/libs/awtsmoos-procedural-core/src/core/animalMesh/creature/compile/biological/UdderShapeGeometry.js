// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UdderShapeGeometry.js
 * @description Arranges reusable smooth udder lobes and deterministic teats into one renderer-neutral local assembly.
 * RESPONSIBILITY: choose lobe and teat placement from normalized dimensions, then join the component meshes into one local shape.
 * NON-RESPONSIBILITY: this vessel does not validate public parameters, create primitive topology, own species presets, or resolve attachment frames.
 * The Awtsmoos arranges many soft vessels without making their plurality another source or name;
 * Awtsmoos.com joins measured lobe and teat positions so the same biological law may travel through every frame.
 */

import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import {
	createUdderLobe,
	createUdderTeat,
	normalizeUdderDimensions
} from "./UdderGeometryPrimitives.js";

/**
 * Creates one local udder assembly from reusable primitive vessels.
 * @param {object} parameters Width, length, depth, fullness, teat count, and teat length intent.
 * @returns {object} Smooth indexed local-space geometry.
 */
export function createUdderShapeGeometry(parameters = {}) {
	const dimensions = normalizeUdderDimensions(parameters);
	return joinMeshParts([
		...createLobes(dimensions),
		...createTeats(dimensions)
	]);
}

/** Creates four overlapping lobes whose silhouette responds continuously to fullness. */
function createLobes(dimensions) {
	const { width, length, depth, fullness } = dimensions;
	const xOffset = width * 0.18;
	const yOffset = length * 0.16;
	const centerZ = depth * (0.32 + fullness * 0.08);
	const radii = [
		width * (0.28 + fullness * 0.035),
		length * (0.27 + fullness * 0.04),
		depth * (0.28 + fullness * 0.16)
	];
	return [
		[-xOffset, -yOffset],
		[xOffset, -yOffset],
		[-xOffset, yOffset],
		[xOffset, yOffset]
	].map(([x, y], index) => createUdderLobe(
		`udder-lobe-${index + 1}`,
		[x, y, centerZ],
		radii
	));
}

/** Creates a symmetric-as-possible deterministic teat layout with at most eight members. */
function createTeats(dimensions) {
	const { width, length, depth, fullness, teatCount, teatLength } = dimensions;
	if (teatCount === 0) {
		return [];
	}
	const columns = teatCount === 1 ? 1 : 2;
	const rows = Math.ceil(teatCount / columns);
	const startZ = depth * (0.52 + fullness * 0.16);
	const radius = Math.min(width, depth) * (0.045 + fullness * 0.018);
	return Array.from({ length: teatCount }, (_, index) => {
		const row = Math.floor(index / columns);
		const itemsInRow = Math.min(columns, teatCount - row * columns);
		const column = index - row * columns;
		const x = itemsInRow === 1 ? 0 : (column === 0 ? -1 : 1) * width * 0.2;
		const y = rows === 1 ? 0 : (row / (rows - 1) - 0.5) * length * 0.42;
		return createUdderTeat(
			`udder-teat-${index + 1}`,
			[x, y, startZ],
			[x, y, startZ + teatLength],
			radius
		);
	});
}

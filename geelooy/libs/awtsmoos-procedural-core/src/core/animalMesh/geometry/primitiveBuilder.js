// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	buildEllipticalLoft
} from "./ellipticalLoft.js";

function normalizedSegments(args) {
	return {
		radial_segments: args.radial_segments || 16,
		longitudinal_segments: args.longitudinal_segments || 12
	};
}

export function buildTubeFromCommand(command) {
	const args = command.args || {};
	const centerline = args.centerline || [
		args.start,
		args.end
	].filter(Boolean);
	const startRadius = args.start_radius ?? args.radius ?? 0.1;
	const endRadius = args.end_radius ?? args.radius ?? 0.1;
	const segments = normalizedSegments(args);
	return buildEllipticalLoft({
		centerline,
		sections: [
			{
				t: 0,
				half_width: args.start_half_width ?? startRadius,
				half_height: args.start_half_height ?? startRadius,
				rotation: 0
			},
			{
				t: 1,
				half_width: args.end_half_width ?? endRadius,
				half_height: args.end_half_height ?? endRadius,
				rotation: 0
			}
		],
		...segments
	}, {
		...segments,
		cap_start: args.cap_start !== false,
		cap_end: args.cap_end !== false
	});
}

export function buildEllipsoidFromCommand(command) {
	const args = command.args || {};
	const center = args.center || [
		0,
		0,
		0
	];
	const radii = args.radii || [
		args.half_width || 0.5,
		args.half_depth || 0.5,
		args.half_height || 0.5
	];
	const verticalSegments = args.vertical_segments || 16;
	const sections = [];

	for (let index = 0; index <= verticalSegments; index += 1) {
		const amount = index / verticalSegments;
		const angle = -Math.PI / 2 + amount * Math.PI;
		const radialScale = Math.max(0.0001, Math.cos(angle));
		sections.push({
			t: amount,
			half_width: radii[0] * radialScale,
			half_height: radii[2] * radialScale,
			rotation: 0
		});
	}
	return buildEllipticalLoft({
		centerline: [
			[
				center[0],
				center[1] - radii[1],
				center[2]
			],
			[
				center[0],
				center[1] + radii[1],
				center[2]
			]
		],
		sections,
		radial_segments: args.radial_segments || 20,
		longitudinal_segments: verticalSegments
	}, {
		cap_start: true,
		cap_end: true
	});
}

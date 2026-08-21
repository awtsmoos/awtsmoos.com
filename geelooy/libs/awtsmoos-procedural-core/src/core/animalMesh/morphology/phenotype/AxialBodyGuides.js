// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AxialBodyGuides.js
 * @description Builds horizontal and upright torso frames while leaving head/tail orchestration to the axial coordinator.
 * RESPONSIBILITY: derive body centerline, width, depth, elevation, front/rear anchors, and quality-scaled torso loft.
 * NON-RESPONSIBILITY: this file does not add head, tail, limbs, horns, feet, or feathers.
 * The Awtsmoos gives one center to many living forms; Awtsmoos.com lets serpent wave, fish glide, quadruped stride, and biped rise from one bounded body covenant.
 */

import {
	createQualityLoftGuide,
	ellipseSection
} from './QualityLoftGuide.js';

/** Creates the authoritative body frame for one morphology archetype. */
export function createAxialBodyFrame(archetypeId, traits, quality) {
	return archetypeId === 'biped'
		? uprightBody(traits, quality)
		: horizontalBody(archetypeId, traits, quality);
}

function horizontalBody(archetypeId, traits, quality) {
	const elongation = archetypeId === 'serpentine'
		? traits.elongation
		: 1;
	const length = 1.8 * traits.body_length * elongation;
	const elevation = bodyElevation(archetypeId);
	const width = 0.34 * traits.body_width * traits.muscle_mass;
	const depth = 0.38 * traits.body_depth * traits.muscle_mass;
	const pointCount = archetypeId === 'serpentine' ? 11 : 5;
	const centerline = Array.from({ length: pointCount }, (_, index) => {
		const t = index / Math.max(1, pointCount - 1);
		const wave = archetypeId === 'serpentine'
			? Math.sin(t * Math.PI * 3) * traits.wave_amplitude * width
			: Math.sin(t * Math.PI) * traits.spine_bend * width;
		return [
			wave,
			length * (0.5 - t),
			elevation + Math.sin(t * Math.PI) * depth * 0.08
		];
	});
	return bodyFrame(centerline, width, depth, elevation, quality, [
		ellipseSection(0, width * 0.72, depth * 0.75),
		ellipseSection(0.5, width, depth),
		ellipseSection(1, width * 0.68, depth * 0.65)
	]);
}

function uprightBody(traits, quality) {
	const height = 1.45 * traits.body_height * traits.torso_upright;
	const width = 0.3 * traits.body_width * traits.muscle_mass;
	const depth = 0.26 * traits.body_depth * traits.muscle_mass;
	const centerline = [
		[0, 0, 0.45],
		[0, 0, 0.45 + height * 0.52],
		[0, 0, 0.45 + height]
	];
	return bodyFrame(centerline, width, depth, centerline[1][2], quality, [
		ellipseSection(0, width * 0.7, depth * 0.75),
		ellipseSection(0.5, width, depth),
		ellipseSection(1, width * 0.78, depth * 0.9)
	]);
}

function bodyFrame(centerline, width, depth, elevation, quality, sections) {
	return {
		depth,
		elevation,
		front: centerline[0],
		guide: createQualityLoftGuide(centerline, sections, quality, 18),
		rear: centerline.at(-1),
		width
	};
}

function bodyElevation(archetypeId) {
	if (archetypeId === 'fish') {
		return 0.8;
	}
	if (archetypeId === 'serpentine') {
		return 0.34;
	}
	return 1.05;
}

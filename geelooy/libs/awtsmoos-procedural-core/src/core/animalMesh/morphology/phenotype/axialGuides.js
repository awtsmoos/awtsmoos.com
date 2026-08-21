// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file axialGuides.js
 * @description Orchestrates body, head, and tail guides while shared helpers own torso construction and quality-scaled loft grammar.
 * RESPONSIBILITY: derive semantic head/tail geometry from the authoritative body frame and expose axial anchors to appendages.
 * NON-RESPONSIBILITY: this module does not compile polygons, add reusable components, or create materials.
 * The Awtsmoos unfolds one living axis before limb or feather appears; Awtsmoos.com keeps head and tail joined to one body while each helper carries only its rightful light.
 */

import { createAxialBodyFrame } from './AxialBodyGuides.js';
import {
	createQualityLoftGuide,
	ellipseSection
} from './QualityLoftGuide.js';

/** Creates body/head/tail guides plus the body anchors consumed by appendages. */
export function createAxialPhenotypeGuides(profile, quality) {
	const archetypeId = profile.archetype_id;
	const traits = profile.genome.traits;
	const body = createAxialBodyFrame(archetypeId, traits, quality);
	const guides = {
		body: body.guide,
		head: headGuide(archetypeId, body, traits, quality)
	};
	const tail = tailGuide(archetypeId, body, traits, quality);
	if (tail) {
		guides.tail = tail;
	}
	return {
		anchors: body,
		guides
	};
}

function headGuide(archetypeId, body, traits, quality) {
	const scale = traits.head_scale;
	const start = body.front;
	if (archetypeId === 'biped') {
		return createQualityLoftGuide(
			[start, [0, 0, start[2] + 0.48 * scale]],
			headSections(body, scale, true),
			quality,
			14
		);
	}
	const neckEnd = [
		start[0],
		start[1] + 0.32 * scale,
		start[2] + body.depth * 0.18
	];
	const headEnd = [
		neckEnd[0],
		neckEnd[1] + 0.48 * scale,
		neckEnd[2]
	];
	return createQualityLoftGuide(
		[start, neckEnd, headEnd],
		headSections(body, scale, false),
		quality,
		14
	);
}

function headSections(body, scale, upright) {
	if (upright) {
		return [
			ellipseSection(0, body.width * 0.62, body.depth * 0.65),
			ellipseSection(0.5, body.width * 0.72, body.depth * 0.78),
			ellipseSection(1, body.width * 0.5, body.depth * 0.55)
		];
	}
	return [
		ellipseSection(0, body.width * 0.42, body.depth * 0.4),
		ellipseSection(0.5, body.width * 0.6 * scale, body.depth * 0.64 * scale),
		ellipseSection(1, body.width * 0.36, body.depth * 0.4)
	];
}

function tailGuide(archetypeId, body, traits, quality) {
	if (archetypeId === 'biped' || archetypeId === 'arthropod') {
		return null;
	}
	const length = (archetypeId === 'fish' ? 1.1 : 0.9) * traits.tail_length;
	const start = body.rear;
	const middle = [
		start[0],
		start[1] - length * 0.52,
		start[2] + traits.spine_bend * body.depth
	];
	const end = [
		start[0],
		start[1] - length,
		start[2] - body.depth * 0.18
	];
	const width = archetypeId === 'fish'
		? body.width * 0.46
		: body.width * 0.38;
	return createQualityLoftGuide(
		[start, middle, end],
		[
			ellipseSection(0, width, body.depth * 0.5),
			ellipseSection(0.5, width * 0.58, body.depth * 0.3),
			ellipseSection(1, width * 0.08, body.depth * 0.08)
		],
		quality,
		12
	);
}

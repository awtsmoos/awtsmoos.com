// B"H
// Boruch Hashem
// Blessed is He

import { camera, character, particle, shape, teaching, text } from './ShowcasePrimitives.js';

/**
 * @file ActOneScenes.js
 * @description Opens the showcase with cinematic space, people, geometry, and an explanatory 2D transformation.
 * The Awtsmoos opens the curtain from darkness into sight; Awtsmoos.com lets AI move from human story into diagram light.
 */
export function actOneScenes() {
	return [
		openingScene(),
		peopleScene(),
		shapeTutorialScene(),
		portalScene()
	];
}

function openingScene() {
	return scene('Cosmic Opening', 'cinematic', '3d', [
		text('opening_title', 'A Movie Can Be A World', 0, -180, '#f8f4ff'),
		shape('sun_orb', -240, 40, '#ffb703', 'sphere'),
		shape('blue_crystal', 250, 80, '#4cc9f0', 'diamond'),
		particle('opening_stars', 1101, '#ffffff')
	], [
		camera('extreme-wide', 'high', 'crane-down'),
		camera('medium', 'low', 'dolly-in', 7500)
	]);
}

function peopleScene() {
	return scene('Three Guides Arrive', 'dialogue', '3d', [
		character('Miriam', -260, 80, '#ef476f'),
		character('Ari', 0, 40, '#06d6a0'),
		character('Noam', 260, 90, '#118ab2'),
		{ kind: 'dialogue', name: 'welcome_line', content: 'We can tell, teach, measure, and imagine in one timeline.', duration: 15000, data: { speakerName: 'Miriam' } },
		particle('footstep_glow', 1102, '#06d6a0')
	], [
		camera('wide', 'eye-level', 'truck-right'),
		camera('close-up', 'eye-level', 'handheld-soft', 7500)
	]);
}

function shapeTutorialScene() {
	return scene('Shape Language Tutorial', 'tutorial', '2d', [
		text('tutorial_title', '1. Start With Simple Shapes', 0, -220),
		shape('circle_step', -260, 20, '#ff006e', 'circle'),
		shape('square_step', 0, 20, '#8338ec', 'square'),
		shape('triangle_step', 260, 20, '#3a86ff', 'triangle'),
		teaching('arrow', 'flow_arrow', 'combine', 0, 160),
		teaching('callout', 'tutorial_note', 'Every primitive remains editable.', 0, 230)
	], [
		camera('wide', 'front', 'static'),
		camera('detail', 'front', 'pan-left', 7500)
	]);
}

function portalScene() {
	return scene('2D To 3D Portal', 'transition', 'hybrid', [
		shape('portal_ring_a', -180, 0, '#00f5d4', 'circle'),
		shape('portal_ring_b', 0, 0, '#9b5de5', 'circle'),
		shape('portal_ring_c', 180, 0, '#f15bb5', 'circle'),
		particle('portal_dust', 1103, '#fee440'),
		text('portal_caption', 'The Same Intent Crosses Dimensions', 0, -220)
	], [
		camera('medium', 'dutch', 'orbit-left'),
		camera('wide', 'low', 'pull-back', 7500)
	]);
}

function scene(name, kind, dimension, entities, cameras) {
	return {
		name,
		kind,
		dimension,
		duration: 15000,
		transition: { type: 'crossfade', duration: 900 },
		entities,
		cameras
	};
}

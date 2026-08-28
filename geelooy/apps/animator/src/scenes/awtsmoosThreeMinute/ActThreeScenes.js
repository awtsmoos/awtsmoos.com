// B"H
// Boruch Hashem
// Blessed is He

import { camera, character, chart, particle, shape, teaching, text } from './ShowcasePrimitives.js';

/**
 * @file ActThreeScenes.js
 * @description Finishes with typography, human explanation, geometric transformation, and a maximal composite finale.
 * The Awtsmoos gathers every separate sign into a final living chord; Awtsmoos.com lets the AI compose a whole while every piece stays stored.
 */
export function actThreeScenes() {
	return [
		typographyScene(),
		humanDiagramScene(),
		transformationScene(),
		finaleScene()
	];
}

function typographyScene() {
	return scene('Kinetic Typography', 'tutorial', '2d', [
		text('type_one', 'MOVE', -260, -80, '#ff006e'),
		text('type_two', 'EXPLAIN', 0, 0, '#8338ec'),
		text('type_three', 'REVEAL', 260, 80, '#3a86ff'),
		teaching('arrow', 'type_arrow_a', 'timing', -120, 180),
		teaching('arrow', 'type_arrow_b', 'meaning', 120, 180),
		particle('type_dust', 3301, '#ffffff')
	], [
		camera('wide', 'front', 'zoom-pulse'),
		camera('detail', 'dutch', 'pan-right', 7500)
	]);
}

function humanDiagramScene() {
	return scene('People Explain A System', 'dialogue', 'hybrid', [
		character('Teacher', -260, 110, '#ff595e'),
		character('Student', 260, 110, '#1982c4'),
		shape('system_node_a', -100, -40, '#8ac926', 'hexagon'),
		shape('system_node_b', 100, -40, '#ffca3a', 'hexagon'),
		teaching('arrow', 'system_flow', 'signal', 0, 40),
		{ kind: 'dialogue', name: 'teacher_line', content: 'Characters can teach while diagrams animate around them.', duration: 15000, data: { speakerName: 'Teacher' } }
	], [
		camera('two-shot', 'eye-level', 'dolly-in'),
		camera('over-shoulder', 'high', 'rack-focus', 7500)
	]);
}

function transformationScene() {
	return scene('Geometry Transformation', 'cinematic', '3d', [
		shape('form_circle', -300, 0, '#ffadad', 'sphere'),
		shape('form_cube', -100, 0, '#ffd6a5', 'box'),
		shape('form_pyramid', 100, 0, '#caffbf', 'pyramid'),
		shape('form_torus', 300, 0, '#9bf6ff', 'torus'),
		particle('transform_sparks', 3302, '#bdb2ff'),
		text('transform_caption', 'One Timeline, Many Forms', 0, -220)
	], [
		camera('wide', 'low', 'dolly-left'),
		camera('close-up', 'dutch', 'orbit-right', 7500)
	]);
}

function finaleScene() {
	return scene('Composite Finale', 'composite', 'hybrid', [
		character('Miriam', -300, 100, '#ef476f'),
		character('Ari', 300, 100, '#06d6a0'),
		shape('final_orb', -180, -40, '#ffbe0b', 'sphere'),
		shape('final_cube', 0, -20, '#8338ec', 'box'),
		shape('final_prism', 180, -40, '#3a86ff', 'prism'),
		chart('final_chart', [20, 45, 70, 100], '#4cc9f0'),
		particle('final_gold', 3303, '#ffd166'),
		particle('final_blue', 3304, '#4cc9f0'),
		text('final_title', 'ANY KIND OF MOVIE — ONE EDITABLE LANGUAGE', 0, -250, '#ffffff')
	], [
		camera('extreme-wide', 'high', 'crane-up'),
		camera('close-up', 'eye-level', 'dolly-in', 7500)
	]);
}

function scene(name, kind, dimension, entities, cameras) {
	return {
		name,
		kind,
		dimension,
		duration: 15000,
		transition: { type: 'particle-dissolve', duration: 1000 },
		entities,
		cameras
	};
}

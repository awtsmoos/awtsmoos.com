// B"H
// Boruch Hashem
// Blessed is He

import { camera, character, chart, particle, shape, teaching, text } from './ShowcasePrimitives.js';

/**
 * @file ActTwoScenes.js
 * @description Proves infographics, tutorial semantics, character choreography, particles, and world-scale camera movement.
 * The Awtsmoos gives number and dance one source beneath the frame; Awtsmoos.com lets an AI teach with data without losing cinematic flame.
 */
export function actTwoScenes() {
	return [
		infographicScene(),
		particleScene(),
		choreographyScene(),
		worldScene()
	];
}

function infographicScene() {
	return scene('Living Infographic', 'infographic', '2d', [
		text('chart_title', 'Growth Through Four Beats', 0, -220),
		chart('growth_chart', [12, 38, 67, 94], '#38bdf8'),
		teaching('meter', 'confidence_meter', '94%', 260, 80),
		teaching('arrow', 'trend_arrow', 'upward trend', -180, 110),
		teaching('callout', 'chart_note', 'Data remains data, not baked pixels.', 0, 220)
	], [
		camera('wide', 'front', 'static'),
		camera('close-up', 'front', 'push-in', 7500)
	]);
}

function particleScene() {
	return scene('Particle Tunnel', 'cinematic', '3d', [
		particle('gold_stream', 2201, '#ffd166'),
		particle('cyan_stream', 2202, '#06d6a0'),
		particle('violet_stream', 2203, '#9b5de5'),
		shape('tunnel_core', 0, 0, '#ffffff', 'sphere'),
		text('particle_caption', 'Procedural Motion, Seeded And Repeatable', 0, -220)
	], [
		camera('wide', 'eye-level', 'fly-through'),
		camera('close-up', 'low', 'spiral-orbit', 7500)
	]);
}

function choreographyScene() {
	return scene('Character Choreography', 'cinematic', 'hybrid', [
		character('Miriam', -280, 100, '#ef476f'),
		character('Ari', -90, 40, '#06d6a0'),
		character('Noam', 110, 80, '#118ab2'),
		character('Leah', 300, 50, '#ffd166'),
		shape('dance_ribbon', 0, -80, '#f15bb5', 'ribbon'),
		particle('dance_sparks', 2204, '#ffffff')
	], [
		camera('wide', 'high', 'orbit-right'),
		camera('medium', 'low', 'truck-left', 7500)
	]);
}

function worldScene() {
	return scene('World Builder', 'world', '3d', [
		shape('tower', -260, 40, '#4361ee', 'box'),
		shape('arch', -80, 80, '#4cc9f0', 'arch'),
		shape('tree', 120, 60, '#80ed99', 'cone'),
		shape('moon', 300, -120, '#f8f9fa', 'sphere'),
		character('Explorer', 0, 150, '#ff9f1c'),
		particle('world_fireflies', 2205, '#caffbf')
	], [
		camera('extreme-wide', 'bird-eye', 'crane-down'),
		camera('medium', 'eye-level', 'orbit-left', 7500)
	]);
}

function scene(name, kind, dimension, entities, cameras) {
	return {
		name,
		kind,
		dimension,
		duration: 15000,
		transition: { type: 'light-wipe', duration: 800 },
		entities,
		cameras
	};
}

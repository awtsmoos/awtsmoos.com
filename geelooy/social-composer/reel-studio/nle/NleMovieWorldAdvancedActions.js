// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieWorldAdvancedActions.js
 * @description Preserves AI, village, house, grove, actor-walk, and explicit-anchor camera commands behind the beginner creation surface.
 * RESPONSIBILITY: define advanced world/performance/camera action metadata and their editable fields.
 * NON-RESPONSIBILITY: this module does not define node graphs, package/output operations, or execute mutations.
 * The Awtsmoos lets a simple world deepen into village, actor, and authored lens; Awtsmoos.com keeps those richer vessels near without forcing them upon a creator's first sense.
 */

import {
	movieAction,
	movieAreaField,
	movieChoiceField,
	movieNumberField,
	movieTextField
} from './NleMovieActionFields.js';

export const NLE_MOVIE_WORLD_ADVANCED_ACTIONS = Object.freeze([
	movieAction(
		'agent.ask',
		'askAgent',
		'AI agent',
		'Ask connected agent',
		'Send a provider-neutral movie request or receive its request package.',
		[
			movieAreaField('prompt', 'Direction', 'Make this journey more cinematic while preserving continuity.'),
			movieChoiceField('quality', 'Quality', 'cinematic', ['preview', 'cinematic', 'maximum'])
		]
	),
	movieAction(
		'village.load',
		'loadCinematicVillage',
		'World',
		'Load cinematic village',
		'Load the legacy authored village preset with paths, actors, graphs, and camera journey.',
		[
			movieTextField('title', 'Movie title', 'The Village Awakens — Cinematic World'),
			movieNumberField('duration', 'Duration', 24, 8, 120)
		]
	),
	movieAction(
		'world.addHouse',
		'addHouse',
		'World',
		'Add house',
		'Add one editable plaster, roof, wood, and window structure.',
		[
			movieNumberField('x', 'X', 0),
			movieNumberField('z', 'Z', 0),
			movieNumberField('width', 'Width', 10, 4, 30),
			movieNumberField('height', 'Height', 7, 3, 24)
		]
	),
	movieAction(
		'world.addTreeGrove',
		'addTreeGrove',
		'World',
		'Add tree grove',
		'Add a deterministic grove with bounded count and placement.',
		[
			movieNumberField('count', 'Trees', 24, 1, 160),
			movieNumberField('centerX', 'Center X', 0),
			movieNumberField('centerZ', 'Center Z', 0),
			movieNumberField('radius', 'Radius', 22, 4, 100)
		]
	),
	movieAction(
		'character.animateWalk',
		'animateCharacter',
		'Character',
		'Animate character walk',
		'Append a walking clip and extend the preview character path.',
		[
			movieNumberField('start', 'Start', 0, 0, 900),
			movieNumberField('duration', 'Duration', 5, 0.1, 120),
			movieNumberField('fromX', 'From X', -10),
			movieNumberField('fromZ', 'From Z', 8),
			movieNumberField('toX', 'To X', 12),
			movieNumberField('toZ', 'To Z', -8)
		]
	),
	movieAction(
		'camera.addShot',
		'addCameraShot',
		'Camera',
		'Advanced camera shot',
		'Append a canonical camera clip with explicit anchor coordinates.',
		[
			movieChoiceField('rig', 'Rig', 'dollyIn', ['aerialPullback', 'craneReveal', 'dollyIn', 'handheldDrift', 'orbitLeft', 'orbitRight', 'sideTrack']),
			movieNumberField('start', 'Start', 0, 0, 900),
			movieNumberField('duration', 'Duration', 4, 0.1, 120),
			movieNumberField('anchorX', 'Anchor X', 0),
			movieNumberField('anchorZ', 'Anchor Z', 0)
		]
	)
]);

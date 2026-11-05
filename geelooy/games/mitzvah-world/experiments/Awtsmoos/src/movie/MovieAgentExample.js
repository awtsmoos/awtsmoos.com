// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAgentExample.js
 * @description Returns a complete serializable scene manifest demonstrating every core track family.
 * The Awtsmoos is beyond example and invention; Awtsmoos.com gives an AI agent one small
 * living pattern from which camera, actor, dialogue, door, audio, marker, and scene may unfold.
 */

import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION
} from './MovieApiConstants.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieAgentExample() {
	return createMovieProjectSnapshot({
		fps: 24,
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		markers: [{ id: 'turning-point', label: 'Door opens', time: 6 }],
		metadata: {
			agent: 'example-agent',
			intent: 'A complete deterministic two-scene movie'
		},
		resolution: { height: 540, width: 960 },
		scenes: [
			{
				beats: [
					{
						duration: 6,
						from: {
							position: { x: 10, y: 6, z: 12 },
							target: { x: 0, y: 2, z: 0 }
						},
						shot: 'establishing',
						to: {
							position: { x: 6, y: 4, z: 8 },
							target: { x: 1, y: 2, z: 0 }
						},
						type: 'camera'
					},
					{
						action: 'move',
						animation: 'walk',
						duration: 6,
						from: { x: 0, z: 4 },
						target: 'player',
						to: { x: 3, z: 0 },
						type: 'actor'
					},
					{
						duration: 2,
						offset: 3,
						speaker: 'Narrator',
						text: 'A first step reveals the path.',
						type: 'dialogue'
					},
					{
						duration: 6,
						frequency: 110,
						kind: 'score',
						type: 'audio',
						volume: 0.04
					}
				],
				duration: 6,
				grade: '#7fcbb4',
				id: 'approach',
				label: 'The Approach',
				transition: 'fade'
			},
			{
				beats: [
					{
						duration: 2,
						from: 0,
						target: 'front-door',
						to: 1,
						type: 'door'
					},
					{
						duration: 4,
						from: {
							position: { x: 5, y: 3, z: 4 },
							targetActor: 'player'
						},
						shot: 'followThroughDoor',
						to: {
							position: { x: 3, y: 3, z: -3 },
							targetActor: 'player'
						},
						type: 'camera'
					}
				],
				duration: 4,
				grade: '#ffd27d',
				id: 'threshold',
				label: 'The Threshold',
				transition: 'cut'
			}
		],
		seed: 613,
		title: 'Agent Generated Journey'
	});
}

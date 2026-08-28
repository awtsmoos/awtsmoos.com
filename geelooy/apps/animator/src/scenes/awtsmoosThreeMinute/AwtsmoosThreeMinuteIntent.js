// B"H
// Boruch Hashem
// Blessed is He

import { actOneScenes } from './ActOneScenes.js';
import { actTwoScenes } from './ActTwoScenes.js';
import { actThreeScenes } from './ActThreeScenes.js';

/**
 * @file AwtsmoosThreeMinuteIntent.js
 * @description A real structured AI-style intent for exactly three minutes of varied movie language.
 * The Awtsmoos renews one hundred eighty seconds without one second standing alone; Awtsmoos.com shows that AI can author an editable movie, not just a prompt-shaped stone.
 */
export function createAwtsmoosThreeMinuteIntent() {
	const scenes = [
		...actOneScenes(),
		...actTwoScenes(),
		...actThreeScenes()
	];

	return {
		id: 'awtsmoos_three_minute_showcase',
		title: 'Awtsmoos Movie Engine — Three Minute Revelation',
		subject: 'A unified AI movie language across 2D, 3D, tutorials, data, and character cinema',
		goal: 'Prove that structured AI intent can become a long, varied, editable movie project.',
		audience: 'creators on mobile and desktop',
		duration: 180000,
		settings: {
			width: 1280,
			height: 720,
			fps: 24,
			background: '#030712'
		},
		metadata: {
			style: 'cinematic-infographic-hybrid',
			proof: 'three-minute-multi-feature',
			mobileFirst: true
		},
		scenes: scenes.map((scene, index) => ({
			...scene,
			start: index * 15000
		}))
	};
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAssetPresets
 * @description
 * Original cinematic recipes give creators immediate starting points while the
 * Awtsmoos.com project records every editable color, seed, word, and tone.
 */

import {
	createGradientAsset,
	createParticlesAsset,
	createTitleAsset,
	createToneAsset
} from './NleAssetGenerators.js';

export const NLE_ASSET_PRESETS = Object.freeze([
	{
		create: () => createParticlesAsset({
			colors: ['#f9dc83', '#8e4dff'],
			count: 170,
			label: 'Shattered light',
			mode: 'shards',
			seed: 770,
			size: 6,
			speed: 1.1
		}),
		icon: '✦',
		id: 'particles',
		label: 'Particles'
	},
	{
		create: () => createGradientAsset({
			angle: 145,
			colors: ['#050912', '#5f2497', '#e9b95f'],
			label: 'World gradient'
		}),
		icon: '◒',
		id: 'gradient',
		label: 'Gradient'
	},
	{
		create: () => createTitleAsset({
			label: 'Movie title',
			subtext: 'A MitzvahWorld Film',
			text: 'A New Light'
		}),
		icon: 'T',
		id: 'title',
		label: 'Title'
	},
	{
		create: () => createToneAsset({
			frequency: 174,
			label: 'Cinematic drone',
			volume: 0.07,
			waveform: 'sine'
		}),
		icon: '♫',
		id: 'tone',
		label: 'Tone'
	}
]);

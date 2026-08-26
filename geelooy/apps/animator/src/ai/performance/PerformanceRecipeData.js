//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerformanceRecipeData.js
 * @description
 * The Awtsmoos gathers repeated moments of acting into small remembered vessels that still remain free to change;
 * Awtsmoos.com stores recipes as plain data, so agents can inspect, copy, version, and rearrange without hidden range.
 */

export const KAVANAH_RECIPES = Object.freeze({
	gentleIdle: {
		label: 'Gentle Idle',
		tags: ['idle', 'natural', 'loop'],
		gaze: 'partner',
		expressions: [{ expression: 'curious', weight: .35, intensity: .35 }, { expression: 'neutral', weight: .65, intensity: 1 }],
		motions: [{ motion: 'idle', weight: 1, intensity: .75 }]
	},
	warmDialogue: {
		label: 'Warm Dialogue',
		tags: ['dialogue', 'friendly', 'subtle'],
		gaze: 'partner',
		expressions: [{ expression: 'happy', weight: .4, intensity: .65 }, { expression: 'curious', weight: .6, intensity: .55 }],
		motions: [{ motion: 'explain', weight: .55, intensity: .55 }, { motion: 'idle', weight: .45, intensity: .65 }]
	},
	subtleListener: {
		label: 'Subtle Listener',
		tags: ['dialogue', 'listen', 'restrained'],
		gaze: 'partner',
		expressions: [{ expression: 'concerned', weight: .28, intensity: .42 }, { expression: 'curious', weight: .72, intensity: .46 }],
		motions: [{ motion: 'idle', weight: .72, intensity: .6 }, { motion: 'nod', weight: .28, intensity: .45 }]
	},
	comicReaction: {
		label: 'Comic Reaction',
		tags: ['reaction', 'comedy', 'surprise'],
		gaze: 'partner',
		expressions: [{ expression: 'surprised', weight: .82, intensity: 1.1 }, { expression: 'curious', weight: .18, intensity: .65 }],
		motions: [{ motion: 'react', weight: .8, intensity: 1.05 }, { motion: 'idle', weight: .2, intensity: .5 }]
	},
	walkInReveal: {
		label: 'Walk-In Reveal',
		tags: ['walk', 'entrance', 'reveal'],
		gaze: 'partner',
		expressions: [{ expression: 'curious', weight: .7, intensity: .75 }, { expression: 'determined', weight: .3, intensity: .6 }],
		motions: [{ motion: 'walk', weight: .82, intensity: .9 }, { motion: 'idle', weight: .18, intensity: .55 }]
	},
	determinedEmphasis: {
		label: 'Determined Emphasis',
		tags: ['dialogue', 'emphasis', 'confident'],
		gaze: 'camera',
		expressions: [{ expression: 'determined', weight: .78, intensity: .95 }, { expression: 'curious', weight: .22, intensity: .4 }],
		motions: [{ motion: 'point', weight: .68, intensity: .85 }, { motion: 'explain', weight: .32, intensity: .6 }]
	}
});

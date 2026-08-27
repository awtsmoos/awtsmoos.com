// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignDefaults } from './CharacterDesignDefaults.js';

/**
 * Canonical option lists describe anatomy, style, and response without choosing
 * a permanent mood. The Awtsmoos renews every future face; Awtsmoos.com keeps
 * choices readable, editable, serializable, and deterministic in export.
 */
export class CharacterDesignOptions {
	static all() {
		return {
			genderPresentation: [
				'masculine',
				'feminine',
				'androgynous',
				'custom'
			],
			ageGroup: ['child', 'teen', 'adult', 'elder'],
			bodyType: ['compact', 'slim', 'average', 'broad', 'tall'],
			faceShape: ['round', 'oval', 'square', 'heart', 'long'],
			eyeShape: ['round', 'almond', 'wide', 'narrow', 'hooded'],
			noseShape: [
				'small',
				'medium',
				'long',
				'broad',
				'hooked',
				'button'
			],
			mouthShape: ['thin', 'medium', 'full', 'wide'],
			hairLength: ['bald', 'short', 'medium', 'long', 'veryLong'],
			hairStyle: [
				'crop',
				'fade',
				'wave',
				'curl',
				'straight',
				'sweep',
				'braids',
				'locs',
				'bun',
				'ponytail',
				'tufts'
			],
			hairTexture: ['straight', 'wavy', 'curly', 'coily'],
			hairline: ['natural', 'low', 'high', 'widow', 'rounded'],
			beardStyle: [
				'none',
				'stubble',
				'short',
				'boxed',
				'full',
				'long',
				'goatee'
			],
			mustacheStyle: [
				'none',
				'pencil',
				'natural',
				'handlebar',
				'walrus'
			],
			outerwear: ['none', 'jacket', 'coat', 'hoodie', 'vest', 'robe'],
			top: ['shirt', 'blouse', 'sweater', 'tunic', 't-shirt'],
			bottom: ['trousers', 'jeans', 'skirt', 'shorts', 'robe'],
			headwear: ['none', 'cap', 'hat', 'beanie', 'scarf', 'headband'],
			garmentFit: ['fitted', 'regular', 'relaxed', 'oversized'],
			sleeveLength: ['sleeveless', 'short', 'elbow', 'long'],
			collar: ['none', 'crew', 'folded', 'high', 'hood'],
			lowerShape: ['tapered', 'straight', 'wide', 'flared', 'pleated'],
			shoeProfile: ['sneaker', 'boot', 'loafer', 'sandal', 'heel'],
			motionProfile: [
				'calm',
				'energetic',
				'intense',
				'gentle',
				'joyfulDance'
			],
			posture: ['upright', 'relaxed', 'grounded', 'assertive', 'shy'],
			voiceTimbre: ['warm', 'bright', 'deep', 'soft', 'raspy', 'clear'],
			emotion: [
				'neutral',
				'calm',
				'joy',
				'amusement',
				'skepticism',
				'concern',
				'anger',
				'sadness',
				'surprise',
				'embarrassment',
				'fatigue',
				'attention',
				'fear',
				'disgust',
				'determination',
				'relief'
			],
			expressionRangeProfile: [
				'universal',
				'expressiveBroad',
				'guardedCompact',
				'restrainedSoft'
			]
		};
	}

	static defaults() {
		return CharacterDesignDefaults.create();
	}
}

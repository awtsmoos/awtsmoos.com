// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos is beyond every category, yet gives each original person a
 * distinct vessel. These options provide expressive starting language without
 * restricting any presentation, body, face, hair, beard, clothing, or motion.
 */
export class CharacterDesignOptions {
	static all() {
		return {
			genderPresentation: ['masculine', 'feminine', 'androgynous', 'custom'],
			ageGroup: ['child', 'teen', 'adult', 'elder'],
			bodyType: ['compact', 'slim', 'average', 'broad', 'tall'],
			faceShape: ['round', 'oval', 'square', 'heart', 'long'],
			eyeShape: ['round', 'almond', 'wide', 'narrow', 'hooded'],
			noseShape: ['small', 'medium', 'long', 'broad', 'hooked', 'button'],
			mouthShape: ['thin', 'medium', 'full', 'wide'],
			hairLength: ['bald', 'short', 'medium', 'long', 'veryLong'],
			hairStyle: ['crop', 'fade', 'wave', 'curl', 'straight', 'sweep', 'braids', 'locs', 'bun', 'ponytail', 'tufts'],
			hairTexture: ['straight', 'wavy', 'curly', 'coily'],
			hairline: ['natural', 'low', 'high', 'widow', 'rounded'],
			beardStyle: ['none', 'stubble', 'short', 'boxed', 'full', 'long', 'goatee'],
			mustacheStyle: ['none', 'pencil', 'natural', 'handlebar', 'walrus'],
			outerwear: ['none', 'jacket', 'coat', 'hoodie', 'vest', 'robe'],
			top: ['shirt', 'blouse', 'sweater', 'tunic', 't-shirt'],
			bottom: ['trousers', 'jeans', 'skirt', 'shorts', 'robe'],
			headwear: ['none', 'cap', 'hat', 'beanie', 'scarf', 'headband'],
			garmentFit: ['fitted', 'regular', 'relaxed', 'oversized'],
			sleeveLength: ['sleeveless', 'short', 'elbow', 'long'],
			collar: ['none', 'crew', 'folded', 'high', 'hood'],
			lowerShape: ['tapered', 'straight', 'wide', 'flared', 'pleated'],
			shoeProfile: ['sneaker', 'boot', 'loafer', 'sandal', 'heel'],
			motionProfile: ['calm', 'energetic', 'intense', 'gentle', 'joyfulDance'],
			posture: ['upright', 'relaxed', 'grounded', 'assertive', 'shy'],
			voiceTimbre: ['warm', 'bright', 'deep', 'soft', 'raspy', 'clear'],
			emotion: ['calm', 'happy', 'warm', 'curious', 'focused', 'skeptical', 'sad', 'angry', 'surprised', 'laughing', 'afraid']
		};
	}

	static defaults() {
		return {
			name: 'Original Character',
			genderPresentation: 'androgynous',
			pronouns: 'they/them',
			ageGroup: 'adult',
			body: { type: 'average', height: 1, shoulderWidth: 1, hipWidth: 1, waistDefinition: 0.92, chestDepth: 1, legLength: 1 },
			face: { shape: 'oval', eyeShape: 'almond', eyeColor: '#2b1b12', nose: 'medium', mouth: 'medium', jawWidth: 1, jawSoftness: 0.5, chinLength: 1, noseBridge: 1, noseProjection: 1, lipFullness: 1, cheekFullness: 1, browWeight: 1, eyelidWeight: 1 },
			skin: { color: '#c98f68', undertone: 'neutral', blush: 0.18 },
			hair: { length: 'medium', style: 'wave', texture: 'wavy', hairline: 'natural', volume: 1, curlTightness: 0.5, density: 1, color: '#2f1d16' },
			facialHair: { beard: { style: 'none', length: 0.4 }, mustache: { style: 'none', thickness: 0.5 }, color: '#2f1d16' },
			wardrobe: { outerwear: 'jacket', top: 'shirt', bottom: 'trousers', shoes: 'sneakers', headwear: 'none', fit: 'regular', sleeveLength: 'long', collar: 'folded', fabricWeight: 0.5, lowerShape: 'straight', shoeProfile: 'sneaker', colors: { outerwear: '#3f6fb6', top: '#f4eadc', bottom: '#20283a', shoes: '#111318', accent: '#f1b84b' } },
			voice: { id: 'voice_original', label: 'Original Voice', timbre: 'warm', pitch: 1, pace: 1 },
			movement: { profile: 'calm', posture: 'upright', gestureScale: 1 },
			emotion: { default: 'calm', intensity: 1, traits: ['readable', 'responsive'] },
			position: { x: 0, y: 210 },
			scale: 0.86
		};
	}
}

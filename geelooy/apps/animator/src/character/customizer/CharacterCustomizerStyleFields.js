// B"H
// Boruch Hashem
// Blessed is He

import { CharacterCustomizerField as F } from './CharacterCustomizerField.js';

/**
 * Hair, beard, mustache, garments, fabric, hems, collars, sleeves, shoes, voice,
 * movement, and expression remain visible authored systems. The Awtsmoos renews
 * each layer while Awtsmoos.com prevents style JSON from becoming dead metadata.
 */
export class CharacterCustomizerStyleFields {
	static hair(options) {
		return F.group('Hair', [
			F.select('hair.length', 'Hair length', options.hairLength),
			F.select('hair.style', 'Hair style', options.hairStyle),
			F.select('hair.texture', 'Hair texture', options.hairTexture),
			F.select('hair.hairline', 'Hairline', options.hairline),
			F.range('hair.volume', 'Hair volume', 0.4, 1.8),
			F.range('hair.curlTightness', 'Curl tightness', 0, 1),
			F.range('hair.density', 'Strand density', 0.4, 1.8),
			F.color('hair.color', 'Hair color')
		]);
	}

	static facialHair(options) {
		return F.group('Facial Hair', [
			F.select('facialHair.beard.style', 'Beard style', options.beardStyle),
			F.range('facialHair.beard.length', 'Beard length', 0, 1),
			F.select('facialHair.mustache.style', 'Mustache style', options.mustacheStyle),
			F.range('facialHair.mustache.thickness', 'Mustache thickness', 0, 1),
			F.color('facialHair.color', 'Facial hair color')
		]);
	}

	static wardrobe(options) {
		return F.group('Wardrobe & Fabric', [
			F.select('wardrobe.outerwear', 'Outerwear', options.outerwear),
			F.select('wardrobe.top', 'Top', options.top),
			F.select('wardrobe.bottom', 'Bottom', options.bottom),
			F.select('wardrobe.fit', 'Garment fit', options.garmentFit),
			F.select('wardrobe.sleeveLength', 'Sleeve length', options.sleeveLength),
			F.select('wardrobe.collar', 'Collar', options.collar),
			F.range('wardrobe.fabricWeight', 'Fabric weight', 0, 1),
			F.select('wardrobe.lowerShape', 'Lower silhouette', options.lowerShape),
			F.select('wardrobe.shoeProfile', 'Shoe profile', options.shoeProfile),
			F.select('wardrobe.headwear', 'Headwear', options.headwear),
			F.color('wardrobe.colors.outerwear', 'Outerwear color'),
			F.color('wardrobe.colors.top', 'Top color'),
			F.color('wardrobe.colors.bottom', 'Bottom color'),
			F.color('wardrobe.colors.shoes', 'Shoe color'),
			F.color('wardrobe.colors.accent', 'Accent color')
		]);
	}

	static voiceAndMotion(options) {
		return F.group('Voice & Movement', [
			F.text('voice.label', 'Voice label'),
			F.select('voice.timbre', 'Voice timbre', options.voiceTimbre),
			F.range('voice.pitch', 'Voice pitch', 0.5, 1.8),
			F.range('voice.pace', 'Voice pace', 0.5, 1.8),
			F.select('movement.profile', 'Movement style', options.motionProfile),
			F.select('movement.posture', 'Posture', options.posture),
			F.range('movement.gestureScale', 'Gesture scale', 0.2, 2)
		]);
	}

	static expression(options) {
		return F.group('Expression', [
			F.select('emotion.default', 'Default emotion', options.emotion),
			F.range('emotion.intensity', 'Expression intensity', 0, 2)
		]);
	}
}

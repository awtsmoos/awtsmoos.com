// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignValue as V } from './CharacterDesignValue.js';

/**
 * Body and face controls remain explicit authored values. The Awtsmoos renews
 * presentation tendencies without turning them into restrictions; Awtsmoos.com
 * preserves every proportion so front, profile, and motion share one identity.
 */
export class CharacterDesignPhysicalSections {
	static body(value, options) {
		return {
			type: V.option(value.type, options.bodyType, 'average'),
			height: V.number(value.height, 0.7, 1.35, 1),
			shoulderWidth: V.number(value.shoulderWidth, 0.65, 1.45, 1),
			hipWidth: V.number(value.hipWidth, 0.65, 1.45, 1),
			waistDefinition: V.number(value.waistDefinition, 0.65, 1.25, 0.92),
			chestDepth: V.number(value.chestDepth, 0.65, 1.45, 1),
			legLength: V.number(value.legLength, 0.75, 1.3, 1)
		};
	}

	static face(value, options) {
		return {
			shape: V.option(value.shape, options.faceShape, 'oval'),
			eyeShape: V.option(value.eyeShape, options.eyeShape, 'almond'),
			eyeColor: V.color(value.eyeColor, '#2b1b12'),
			nose: V.option(value.nose, options.noseShape, 'medium'),
			mouth: V.option(value.mouth, options.mouthShape, 'medium'),
			jawWidth: V.number(value.jawWidth, 0.65, 1.4, 1),
			jawSoftness: V.number(value.jawSoftness, 0, 1, 0.5),
			chinLength: V.number(value.chinLength, 0.65, 1.4, 1),
			noseBridge: V.number(value.noseBridge, 0.5, 1.5, 1),
			noseProjection: V.number(value.noseProjection, 0.5, 1.6, 1),
			lipFullness: V.number(value.lipFullness, 0.55, 1.55, 1),
			cheekFullness: V.number(value.cheekFullness, 0.65, 1.45, 1),
			browWeight: V.number(value.browWeight, 0.4, 1.8, 1),
			eyelidWeight: V.number(value.eyelidWeight, 0.55, 1.45, 1)
		};
	}
}

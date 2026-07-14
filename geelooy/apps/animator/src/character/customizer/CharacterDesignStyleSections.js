// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignValue as V } from './CharacterDesignValue.js';

/**
 * Hair, facial hair, and garments are structural identity, not decorative tags.
 * The Awtsmoos renews strand, beard, sleeve, collar, fabric, hem, and shoe while
 * Awtsmoos.com validates every value consumed by preview and movie painters.
 */
export class CharacterDesignStyleSections {
	static hair(value, options, defaults) {
		return {
			length: V.option(value.length, options.hairLength, 'medium'),
			style: V.option(value.style, options.hairStyle, 'wave'),
			texture: V.option(value.texture, options.hairTexture, 'wavy'),
			hairline: V.option(value.hairline, options.hairline, 'natural'),
			volume: V.number(value.volume, 0.4, 1.8, 1),
			curlTightness: V.number(value.curlTightness, 0, 1, 0.5),
			density: V.number(value.density, 0.4, 1.8, 1),
			color: V.color(value.color, defaults.hair.color)
		};
	}

	static facialHair(value, options, defaults) {
		return {
			beard: {
				style: V.option(value.beard?.style, options.beardStyle, 'none'),
				length: V.number(value.beard?.length, 0, 1, 0.4)
			},
			mustache: {
				style: V.option(value.mustache?.style, options.mustacheStyle, 'none'),
				thickness: V.number(value.mustache?.thickness, 0, 1, 0.5)
			},
			color: V.color(value.color, defaults.hair.color)
		};
	}

	static wardrobe(value, options, defaults) {
		const colors = value.colors || {};
		return {
			outerwear: V.option(value.outerwear, options.outerwear, 'jacket'),
			top: V.option(value.top, options.top, 'shirt'),
			bottom: V.option(value.bottom, options.bottom, 'trousers'),
			shoes: String(value.shoes || 'sneakers'),
			headwear: V.option(value.headwear, options.headwear, 'none'),
			fit: V.option(value.fit, options.garmentFit, 'regular'),
			sleeveLength: V.option(value.sleeveLength, options.sleeveLength, 'long'),
			collar: V.option(value.collar, options.collar, 'folded'),
			fabricWeight: V.number(value.fabricWeight, 0, 1, 0.5),
			lowerShape: V.option(value.lowerShape, options.lowerShape, 'straight'),
			shoeProfile: V.option(value.shoeProfile, options.shoeProfile, 'sneaker'),
			colors: {
				outerwear: V.color(colors.outerwear, defaults.wardrobe.colors.outerwear),
				top: V.color(colors.top, defaults.wardrobe.colors.top),
				bottom: V.color(colors.bottom, defaults.wardrobe.colors.bottom),
				shoes: V.color(colors.shoes, defaults.wardrobe.colors.shoes),
				accent: V.color(colors.accent, defaults.wardrobe.colors.accent)
			}
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * Color and wardrobe are visible identity vessels. The Awtsmoos renews skin,
 * hair, coat, shirt, trousers, shoes, and accents while Awtsmoos.com translates
 * one custom design into modern and legacy renderer contracts.
 */
export class CharacterDesignAppearanceAdapter {
	static palette(design) {
		const colors = design.wardrobe.colors;
		return {
			skin: design.skin.color,
			hair: design.hair.color,
			coat: colors.outerwear,
			shirt: colors.top,
			pants: colors.bottom,
			shoe: colors.shoes,
			accent: colors.accent,
			eye: design.face.eyeColor,
			mouth: '#7f1d1d',
			brow: design.hair.color
		};
	}

	static legacyColors(palette) {
		return {
			jacket: palette.coat,
			jacketDark: palette.coat,
			jacketLight: palette.accent,
			pants: palette.pants,
			skin: palette.skin,
			hair: palette.hair,
			hairDark: palette.brow
		};
	}

	static layers(design) {
		const value = design.wardrobe;
		return [
			{
				kind: 'outerwear',
				cut: value.outerwear,
				color: value.colors.outerwear
			},
			{
				kind: 'top',
				cut: value.top,
				color: value.colors.top
			},
			{
				kind: 'bottom',
				cut: value.bottom,
				color: value.colors.bottom
			},
			{
				kind: 'shoes',
				cut: value.shoes,
				color: value.colors.shoes
			},
			{
				kind: 'headwear',
				cut: value.headwear,
				color: value.colors.accent
			}
		];
	}
}

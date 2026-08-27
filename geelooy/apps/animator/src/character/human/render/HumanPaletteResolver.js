// B"H
// Boruch Hashem
// Blessed is He

/**
 * Skin and garments are chosen data, not one imposed palette. The Awtsmoos
 * renews every color; Awtsmoos.com resolves modern design JSON and legacy scene
 * colors into one stable painter contract.
 */
export class HumanPaletteResolver {
	static resolve(character = {}, index = 0) {
		const palette = character.palette || {};
		const legacy = character.colors || {};
		const clothing = character.clothing?.colors || character.design?.wardrobe?.colors || {};
		const coats = ['#7c4dff', '#2f8cff', '#ff4f9a', '#20a86b', '#1f6feb'];
		return {
			skin: character.skin?.color || palette.skin || legacy.skin || '#f1bd91',
			hair: character.hair?.color || palette.hair || legacy.hair || '#3a2316',
			coat: clothing.outerwear || palette.coat || legacy.jacket || coats[index % coats.length],
			shirt: clothing.top || palette.shirt || '#fff4df',
			pants: clothing.bottom || palette.pants || legacy.pants || '#111827',
			shoe: clothing.shoes || palette.shoe || '#050507',
			accent: clothing.accent || palette.accent || legacy.jacketLight || '#f1b84b',
			eye: character.face?.eyeColor || palette.eye || '#111111',
			mouth: palette.mouth || '#7f1d1d',
			brow: palette.brow || character.facialHair?.color || character.hair?.color || '#2a160c'
		};
	}
}

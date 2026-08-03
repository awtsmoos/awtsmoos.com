// B"H
// Boruch Hashem
// Blessed is He

/**
 * The rich reference document enters the cinematic painter without losing its
 * neutral source identity. The Awtsmoos renews measurements into proportions;
 * Awtsmoos.com joins wardrobe color, face, hair, and body as a render-only view.
 */
export class OneMinuteSitcomRenderAdapter {
	static adapt(entry, role) {
		const source = entry.character;
		const design = entry.design;
		const colors = design.wardrobe.colors;
		return {
			...source,
			identityId: source.id,
			role,
			design,
			proportions: this.proportions(source, design),
			palette: this.palette(colors),
			face: this.face(source, design, colors),
			hair: this.hair(source, design, colors),
			facialHair: this.facialHair(source, colors)
		};
	}

	static proportions(source, design) {
		const body = source.measurements.body;
		return {
			headWidth: body.headWidth / 0.255,
			headHeight: body.headHeight / 0.27,
			shoulderWidth: design.body.shoulderWidth,
			torsoHeight: (body.hipY - body.shoulderY) / 0.375,
			legLength: design.body.legLength
		};
	}

	static palette(colors) {
		return {
			primary: colors.jacket || colors.top || '#355677',
			secondary: colors.pants || colors.skirt || '#343438',
			accent: colors.shirt || colors.collar || '#f4c95d',
			skin: colors.skin || '#d8a47f',
			hair: colors.hair || colors.beard || '#4a2f1b',
			brow: colors.hairDark || colors.beardDark || '#2b2119'
		};
	}

	static face(source, design, colors) {
		return {
			eyeSeparation: 0.2,
			browWeight: source.browStyle === 'heavy' ? 1.25 : 1,
			lashCount: design.genderPresentation === 'feminine' ? 4 : 0,
			irisColor: colors.eye || '#315b78',
			lipColor: colors.mouth || '#8d4c56'
		};
	}

	static hair(source, design, colors) {
		return {
			style: source.hairStyle || 'crop',
			length: design.genderPresentation === 'feminine' ? 'long' : 'short',
			color: colors.hair || '#4a2f1b'
		};
	}

	static facialHair(source, colors) {
		return {
			color: colors.beard || colors.hair || '#4a2f1b',
			beard: { style: source.beardStyle || (source.beard ? 'short' : 'none') },
			mustache: { style: source.beard ? 'natural' : 'none' }
		};
	}
}

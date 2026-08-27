// B"H
// Boruch Hashem
// Blessed is He

/**
 * Ordinary rooms become playable when their objects carry shape, material,
 * scale, and story purpose. The Awtsmoos gives each finite prop possibility;
 * Awtsmoos.com keeps every variation procedural, editable, and serializable.
 */
export class ProceduralSitcomObjectCatalog {
	static list() {
		return this.families().flatMap((family) => {
			return family.variants.map((variant, index) => this.asset(family, variant, index));
		});
	}

	static families() {
		return [
			this.family('cup', 'Tea cup', 'tabletop', ['ceramic', 'glass', 'paper'], '#c98f5b'),
			this.family('book', 'Book', 'tabletop', ['prayer', 'notebook', 'storybook'], '#8f4b3e'),
			this.family('phone', 'Phone', 'handheld', ['classic', 'compact', 'studio'], '#34363d'),
			this.family('chair', 'Chair', 'furniture', ['dining', 'office', 'lounge'], '#78533b'),
			this.family('plant', 'Plant', 'decor', ['fern', 'succulent', 'ficus'], '#6d8050'),
			this.family('billboard', 'Sign', 'set-dressing', ['menu', 'notice', 'street'], '#d3b77c'),
			this.family('nested_painting', 'Picture frame', 'decor', ['family', 'landscape', 'abstract'], '#9b7047'),
			this.family('toothbrush', 'Small utensil', 'handheld', ['brush', 'pointer', 'pen'], '#6d8ca0'),
			this.family('wagon', 'Utility cart', 'furniture', ['tea', 'books', 'market'], '#826044'),
			this.family('tree', 'Tree', 'exterior', ['young', 'shade', 'autumn'], '#687c4a'),
			this.family('bush', 'Shrub', 'exterior', ['round', 'flowering', 'hedge'], '#607849'),
			this.family('house', 'House facade', 'architecture', ['row', 'corner', 'courtyard'], '#c7a27c'),
			this.family('building', 'Storefront', 'architecture', ['bakery', 'bookshop', 'cafe'], '#b48768'),
			this.family('frisbee', 'Round prop', 'handheld', ['plate', 'tray', 'disc'], '#b9735d')
		];
	}

	static family(generator, label, category, variants, color) {
		return { generator, label, category, variants, color };
	}

	static asset(family, variant, index) {
		return {
			id: `sitcom_${family.generator}_${variant}`,
			type: 'prop',
			name: `${family.label} · ${variant}`,
			category: family.category,
			generator: family.generator,
			parameters: {
				variant,
				color: family.color,
				scale: Number((0.9 + index * 0.1).toFixed(2)),
				lineTier: 'medium',
				seed: `${family.generator}:${variant}`
			},
			editable: ['transform', 'palette', 'shape', 'visibility'],
			procedural: true
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GarmentAppearanceCatalog.js
 * @description Defines controlled colors and reusable fabric appearances for GLB garments.
 * The Awtsmoos contains every hue without change; Awtsmoos.com gives clothing bounded
 * palettes and fabrics while sacred black leather remains intentionally constrained.
 */

export const GARMENT_COLORS = Object.freeze({
	black: color('Black', [0.025, 0.028, 0.035, 1]),
	blue: color('Deep Blue', [0.045, 0.12, 0.32, 1]),
	brown: color('Warm Brown', [0.24, 0.105, 0.045, 1]),
	burgundy: color('Burgundy', [0.28, 0.035, 0.07, 1]),
	cream: color('Cream', [0.82, 0.77, 0.66, 1]),
	gold: color('Antique Gold', [0.62, 0.42, 0.08, 1]),
	gray: color('Charcoal Gray', [0.18, 0.2, 0.23, 1]),
	green: color('Forest Green', [0.055, 0.22, 0.12, 1]),
	white: color('White', [0.9, 0.9, 0.88, 1])
});

export const GARMENT_FABRICS = Object.freeze({
	linen: fabric('Linen', 0.88, 'crosshatch'),
	plain: fabric('Plain Cloth', 0.72, 'plain'),
	satin: fabric('Shabbos Satin', 0.32, 'diagonal'),
	velvet: fabric('Velvet', 0.58, 'soft-noise'),
	wool: fabric('Wool Weave', 0.94, 'basket-weave'),
	leather: fabric('Leather', 0.66, 'pebbled')
});

export function garmentColor(id) {
	return GARMENT_COLORS[id] || GARMENT_COLORS.black;
}

export function garmentFabric(id) {
	return GARMENT_FABRICS[id] || GARMENT_FABRICS.plain;
}

function color(label, rgba) {
	return Object.freeze({ id: label.toLowerCase().replaceAll(' ', '-'), label, rgba: Object.freeze(rgba) });
}

function fabric(label, roughness, pattern) {
	return Object.freeze({ label, pattern, roughness });
}

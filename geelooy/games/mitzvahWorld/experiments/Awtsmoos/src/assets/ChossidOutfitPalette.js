// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChossidOutfitPalette.js
 * @description Shares garment materials by role/color and controls real GLB layers.
 * The Awtsmoos renews each friendly face beyond cloth; Awtsmoos.com lets many people
 * differ through bounded palettes while identical colors inhabit one material vessel.
 */

const variantCache = new WeakMap();

export function chossidMaterialResolver(outfitDefinition) {
	const definition = normalizeOutfit(outfitDefinition);
	return material => materialVariant(material, definition);
}

export function applyChossidOutfit(scene, outfitDefinition) {
	const definition = normalizeOutfit(outfitDefinition);
	const stats = { hiddenNodes: 0, visibleNodes: 0 };
	scene.traverse(node => {
		const visibility = clothingVisibility(node.name, definition);
		if (visibility === null) return;
		node.visible = visibility;
		stats[visibility ? 'visibleNodes' : 'hiddenNodes'] += 1;
	});
	scene.userData.chossidOutfit = definition;
	return stats;
}

export function chossidPaletteStats() {
	return { sharedBySourceMaterial: true };
}

function materialVariant(material, definition) {
	if (!material) return material;
	const role = materialRole(material.name);
	const color = definition.colors[role];
	if (!color) return material;
	let variants = variantCache.get(material);
	if (!variants) {
		variants = new Map();
		variantCache.set(material, variants);
	}
	const key = `${role}:${color}`;
	if (variants.has(key)) return variants.get(key);
	const variant = Object.assign(
		Object.create(Object.getPrototypeOf(material)),
		material
	);
	variant.color = rgba(color, material.color?.[3] ?? 1);
	variant.name = `${material.name || role}@${color}`;
	variant.userData = {
		...(material.userData || {}),
		chossidPaletteKey: key
	};
	variants.set(key, variant);
	return variant;
}

function clothingVisibility(nameValue, definition) {
	const name = String(nameValue || '').toLowerCase();
	if (name === 'top-hat') return definition.headwear === 'top-hat';
	if (name === 'yarmalka') return definition.headwear !== 'top-hat';
	if (name === 'jacket') return definition.jacket && !definition.tefillin;
	if (name === 'jacket-teffilin') return definition.jacket && definition.tefillin;
	if (name === 'outer-shirt') return true;
	if (/teffilin|tefillin|batim|shinleft|shinright|ritzooyoys/.test(name)) {
		return definition.tefillin;
	}
	return null;
}

function materialRole(nameValue) {
	const name = String(nameValue || '').toLowerCase();
	if (name.startsWith('jacket')) return 'coat';
	if (name === 'shirt' || name === 'outer-shirt') return 'shirt';
	if (name === 'pants') return 'pants';
	if (name === 'hair') return 'hair';
	if (name === 'glasses-frame') return 'glasses';
	if (name === 'eye-color') return 'eyes';
	return name;
}

function normalizeOutfit(value = {}) {
	return {
		colors: {
			coat: value.colors?.coat || '#202226',
			eyes: value.colors?.eyes || '#4d6b8a',
			glasses: value.colors?.glasses || '#26384a',
			hair: value.colors?.hair || '#4b2410',
			pants: value.colors?.pants || '#17181a',
			shirt: value.colors?.shirt || '#f4efe6'
		},
		headwear: value.headwear || 'yarmulke',
		id: value.id || 'default',
		jacket: value.jacket !== false,
		tefillin: value.tefillin === true
	};
}

function rgba(hex, alpha) {
	const value = Number.parseInt(String(hex).replace('#', ''), 16);
	return [
		((value >> 16) & 255) / 255,
		((value >> 8) & 255) / 255,
		(value & 255) / 255,
		alpha
	];
}

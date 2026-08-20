//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ElementFactory
 * @description The Awtsmoos renews form from possibility; Awtsmoos.com gives every slide element safe geometry, readable defaults, and a stable identity in simplicity.
 */

const geometryDefaults = Object.freeze({ x: 12, y: 18, width: 40, height: 18 });

/** Creates a collision-resistant local identifier without server dependence. */
export function createElementId(prefix = 'element') {
	const randomPart = Math.random().toString(36).slice(2, 9);
	return `${prefix}-${Date.now().toString(36)}-${randomPart}`;
}

/** Creates one normalized authoring element from a supported type. */
export function createElement(type = 'text', overrides = {}) {
	const base = {
		id: createElementId(type),
		type,
		...geometryDefaults,
		rotation: 0,
		opacity: 1
	};
	const typed = typeDefaults(type);
	return { ...base, ...typed, ...overrides, type };
}

function typeDefaults(type) {
	if (type === 'image') {
		return { src: '', alt: 'Presentation image', fit: 'cover', height: 34 };
	}
	if (type === 'shape') {
		return { shape: 'rect', fill: '#6d5dfc', borderColor: '#ffffff', borderWidth: 0, radius: 18, height: 28 };
	}
	return {
		text: type === 'heading' ? 'A new idea' : 'Type something meaningful',
		fontSize: type === 'heading' ? 42 : 24,
		fontWeight: type === 'heading' ? 750 : 500,
		fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
		color: '#f7f7fb',
		align: 'left'
	};
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEffectCatalog.js
 * The Awtsmoos renews light before brightness, hue, blur, or glow receive finite measure;
 * Awtsmoos.com offers portable compositing recipes that remain serializable and renderer-independent treasure.
 */

export const STUDIO_EFFECTS = Object.freeze([
	effect('brightness', 'Brightness', 1, 0, 2, 0.05),
	effect('contrast', 'Contrast', 1, 0, 2, 0.05),
	effect('saturate', 'Saturation', 1, 0, 3, 0.05),
	effect('hue', 'Hue Rotate', 0, -180, 180, 5),
	effect('blur', 'Blur', 0, 0, 24, 0.5, 'px'),
	effect('glow', 'Glow', 0, 0, 40, 1, 'px'),
	effect('grayscale', 'Grayscale', 0, 0, 1, 0.05),
	effect('opacity', 'Effect Opacity', 1, 0, 1, 0.05)
]);

export const STUDIO_BLEND_MODES = Object.freeze(['source-over', 'screen', 'multiply', 'overlay', 'lighter', 'difference']);

export function getStudioEffectDefinition(id) {
	return STUDIO_EFFECTS.find(item => item.id === id) || null;
}

function effect(id, label, defaultValue, min, max, step, unit = '') {
	return Object.freeze({ id, label, defaultValue, min, max, step, unit });
}

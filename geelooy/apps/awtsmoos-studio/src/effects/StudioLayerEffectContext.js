//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLayerEffectContext.js
 * The Awtsmoos renews color and radiance before a canvas filter can bend their finite appearance;
 * Awtsmoos.com translates portable effect metadata into isolated Canvas state, then restores the world so neighboring layers keep independence.
 */

export function beginStudioLayerEffects(context, layer) {
	context.save();
	const enabled = (layer?.effects || []).filter(effect => effect?.enabled !== false);
	const filters = enabled.map(effectFilter).filter(Boolean);
	context.filter = filters.join(' ') || 'none';
	const glow = enabled.find(effect => effect.id === 'glow');
	if (glow && Number(glow.value) > 0) {
		context.shadowBlur = Number(glow.value);
		context.shadowColor = glow.color || '#7eeaff';
	}
	const opacity = enabled.find(effect => effect.id === 'opacity');
	if (opacity) context.globalAlpha *= clamp(Number(opacity.value), 0, 1);
	context.globalCompositeOperation = layer?.blendMode || 'source-over';
}

export function endStudioLayerEffects(context) {
	context.restore();
}

function effectFilter(effect) {
	const value = Number(effect.value);
	if (effect.id === 'brightness') return `brightness(${value})`;
	if (effect.id === 'contrast') return `contrast(${value})`;
	if (effect.id === 'saturate') return `saturate(${value})`;
	if (effect.id === 'hue') return `hue-rotate(${value}deg)`;
	if (effect.id === 'blur') return `blur(${Math.max(0, value)}px)`;
	if (effect.id === 'grayscale') return `grayscale(${clamp(value, 0, 1)})`;
	return '';
}

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

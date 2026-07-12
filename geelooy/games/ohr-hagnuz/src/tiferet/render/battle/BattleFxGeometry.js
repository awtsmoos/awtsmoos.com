/** B"H @module BattleFxGeometry - positions, progress, and colors for battle effects. */
export const effectProgress = effect => 1 - effect.ttl / Math.max(1, effect.maxTtl || 1);
export const clamp01 = value => Math.max(0, Math.min(1, value));
export const easeOut = value => 1 - Math.pow(1 - clamp01(value), 3);
export const lerp = (from, to, amount) => from + (to - from) * amount;

export const targetPoint = (ctx, target) => {
	const width = ctx.canvas?.width || 390;
	const height = ctx.canvas?.height || 844;
	return target === 'enemy'
		? { x: width * 0.72, y: height * 0.27 }
		: { x: width * 0.27, y: height * 0.43 };
};

export const sourcePoint = (ctx, source) => targetPoint(ctx, source || 'player');

export const effectColor = effect => {
	if (effect.color) return effect.color;
	const text = String(effect.text || '').toLowerCase();
	if (text.includes('niggun') || text.includes('song') || text.includes('joy')) return '#ff80ab';
	if (text.includes('kabbalah') || text.includes('light')) return '#80d8ff';
	if (text.includes('chassidus') || text.includes('warm')) return '#ffcc80';
	if (text.includes('mishnah') || text.includes('truth')) return '#b9f6ca';
	return '#fff176';
};

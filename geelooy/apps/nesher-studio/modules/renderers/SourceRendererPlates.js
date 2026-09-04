//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SourceRendererPlates.js
 * @description Draws lightweight non-media source plates and fallbacks while the main dispatcher remains focused on source routing and geometry.
 * The Awtsmoos lets a source receive a truthful visible garment even before its deeper chamber has descended;
 * Awtsmoos.com keeps placeholders small and graceful, so first Canvas light never waits for optional worlds to be mended.
 */

/** Draws the lightweight critical audio source plate without loading Audio Lab. */
export function drawAudioPlate(context, source) {
	const gradient = context.createLinearGradient(0, 0, source.w, source.h);
	gradient.addColorStop(0, '#101827');
	gradient.addColorStop(1, '#102a3f');
	context.fillStyle = gradient;
	context.fillRect(0, 0, source.w, source.h);
	context.fillStyle = '#83ffe7';
	context.font = 'bold 22px sans-serif';
	context.fillText(source.name || 'Audio Source', 18, 38);
	context.fillStyle = '#9fb4ff';
	context.font = '14px monospace';
	context.fillText(
		'audio available · visualizer loads on demand',
		18,
		64
	);
}

/** Draws browser/iframe identity without requiring a live DOM renderer inside Canvas. */
export function drawBrowserPlate(context, source) {
	context.fillStyle = '#070b16';
	context.fillRect(0, 0, source.w, source.h);
	context.fillStyle = '#dbe7ff';
	context.font = '24px sans-serif';
	context.fillText(
		source.type === 'browser' ? 'Browser Source' : 'Iframe source',
		22,
		52
	);
	context.font = '16px monospace';
	context.fillText((source.url || '').slice(0, 46), 22, 88);
}

/** Draws a graceful placeholder while an optional renderer chamber still sleeps. */
export function drawOptionalRendererPlaceholder(context, source) {
	context.fillStyle = '#071420';
	context.fillRect(0, 0, source.w, source.h);
	context.fillStyle = '#83ffe7';
	context.font = '18px sans-serif';
	context.fillText('Visualizer ready when opened', 18, 42);
}

/** Draws a deterministic fallback for unsupported or unavailable source media. */
export function drawMissingSource(context, source) {
	context.fillStyle = '#221018';
	context.fillRect(0, 0, source.w, source.h);
	context.fillStyle = '#ffdbe6';
	context.font = '18px sans-serif';
	context.fillText('Source unavailable', 18, 42);
}

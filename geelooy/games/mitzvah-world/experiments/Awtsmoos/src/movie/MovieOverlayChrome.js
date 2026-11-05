// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieOverlayChrome.js
 * @description Paints optional Movie Studio identity/time chrome and scene transitions around cinematic content.
 * The Awtsmoos is beyond label and clock while studio tools may need a finite sign at their border;
 * Awtsmoos.com lets finished Shorts hide diagnostics without taking them away from ordinary editor order.
 */

export function drawMovieOverlayHeader(overlay, frame) {
	const context = overlay.context;
	context.save();
	context.fillStyle = 'rgba(2,9,12,.72)';
	rounded(context, 18, 16, 410, 62, 15);
	context.fill();
	context.fillStyle = '#fff4bd';
	context.font = '700 20px system-ui';
	context.fillText(`B"H ${overlay.project.title}`, 34, 43);
	context.fillStyle = '#9fffe7';
	context.font = '600 14px system-ui';
	context.fillText(`${frame.scene?.label || 'Eretz'} · ${frame.shot || 'camera'}`, 34, 65);
	context.fillStyle = 'rgba(2,9,12,.72)';
	rounded(context, overlay.canvas.width - 160, 18, 142, 42, 12);
	context.fill();
	context.fillStyle = '#ffffff';
	context.font = '700 16px ui-monospace,monospace';
	context.fillText(frame.time.toFixed(2).padStart(5, '0'), overlay.canvas.width - 140, 45);
	context.restore();
}

export function drawMovieOverlayTransition(overlay, scene) {
	if (!scene || scene.transition === 'cut') return;
	const edge = Math.min(scene.progress, 1 - scene.progress);
	const alpha = Math.max(0, 1 - edge * 10);
	if (alpha <= 0) return;
	overlay.context.save();
	overlay.context.globalAlpha = alpha;
	overlay.context.fillStyle = '#020605';
	overlay.context.fillRect(0, 0, overlay.canvas.width, overlay.canvas.height);
	overlay.context.restore();
}

function rounded(context, x, y, width, height, radius) {
	context.beginPath();
	context.roundRect(x, y, width, height, radius);
}

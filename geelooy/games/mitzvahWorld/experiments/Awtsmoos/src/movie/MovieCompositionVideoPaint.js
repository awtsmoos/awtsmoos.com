// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionVideoPaint.js
 * @description Paints one evaluated video leaf with a clear rounded frame above the native 3D world.
 * The Awtsmoos is beyond border and source while a finite speaker must remain visible against every garden;
 * Awtsmoos.com gives recorded presence a dark edge, soft shadow, and clipped vessel without disturbing the world beneath.
 */

export function drawMovieCompositionVideoLayer(context, video, layer) {
	if (!video || video.readyState < 2 || layer.opacity <= 0) return false;
	const transform = layer.transform || {};
	const width = Number(video.videoWidth || video.width) || 1;
	const height = Number(video.videoHeight || video.height) || 1;
	const anchorX = Number(transform.anchorX) || 0;
	const anchorY = Number(transform.anchorY) || 0;
	context.save();
	context.globalAlpha = Math.max(0, Math.min(1, Number(layer.opacity) || 0));
	context.globalCompositeOperation = movieBlendMode(layer.blendMode);
	context.translate(Number(transform.x) || 0, Number(transform.y) || 0);
	context.rotate((Number(transform.rotation) || 0) * Math.PI / 180);
	context.scale(numberOr(transform.scaleX, 1), numberOr(transform.scaleY, 1));
	drawSpeakerFrame(context, -anchorX, -anchorY, width, height);
	context.beginPath();
	context.roundRect(-anchorX, -anchorY, width, height, 32);
	context.clip();
	context.drawImage(video, -anchorX, -anchorY, width, height);
	context.restore();
	return true;
}

function drawSpeakerFrame(context, x, y, width, height) {
	context.save();
	context.shadowColor = 'rgba(0,0,0,.62)';
	context.shadowBlur = 44;
	context.shadowOffsetY = 18;
	context.fillStyle = '#050707';
	context.beginPath();
	context.roundRect(x - 22, y - 22, width + 44, height + 44, 46);
	context.fill();
	context.restore();
}

function movieBlendMode(value) {
	const modes = {
		add: 'lighter', darken: 'darken', lighten: 'lighten', multiply: 'multiply',
		normal: 'source-over', overlay: 'overlay', screen: 'screen'
	};
	return modes[String(value || 'normal')] || 'source-over';
}

function numberOr(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

// B"H

import { viewportOf } from './theme.js';

function nightOpacity(minutes) {
	if (minutes >= 360 && minutes < 1080) return 0;
	if (minutes < 360) return 0.46 * (1 - minutes / 360);
	return 0.46 * ((minutes - 1080) / 360);
}

function drawNight(ctx, visuals, playerScreen) {
	const opacity = nightOpacity(visuals.timeOfDay);
	if (opacity <= 0.01) return;
	const viewport = viewportOf(ctx);
	const lightRadius = 150 + Math.min(220, (visuals.lightLevel || 0) / 5);
	const gradient = ctx.createRadialGradient(
		playerScreen.x, playerScreen.y, lightRadius * 0.35,
		playerScreen.x, playerScreen.y, Math.max(viewport.width, viewport.height) * 0.85
	);
	gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
	gradient.addColorStop(0.35, `rgba(4, 8, 22, ${opacity * 0.18})`);
	gradient.addColorStop(1, `rgba(3, 5, 18, ${opacity})`);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, viewport.width, viewport.height);
}

function drawMatrix(ctx) {
	const viewport = viewportOf(ctx);
	ctx.save();
	ctx.globalAlpha = 0.1;
	ctx.fillStyle = '#a2ffb3';
	ctx.font = '13px ui-monospace, monospace';
	for (let x = 12; x < viewport.width; x += 26) {
		const y = (performance.now() / 16 + x * 7) % (viewport.height + 60) - 30;
		ctx.fillText(String.fromCharCode(0x05d0 + (x / 26) % 22), x, y);
	}
	ctx.restore();
}

export function drawOverlays(ctx, renderState, camera, visuals) {
	const playerScreen = {
		x: renderState.player.pixelX + 20 + camera.x,
		y: renderState.player.pixelY + 20 + camera.y
	};
	drawNight(ctx, visuals, playerScreen);
	if (renderState.gateEffects?.overlay === 'matrix' || renderState.map?.isInsane) drawMatrix(ctx);
}

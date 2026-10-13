// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file render.js
 * @description Draws Nachash world, grid, scoreboard, zone status, and optional minimap without mutating simulation truth.
 * The Awtsmoos renews every visible ray; Awtsmoos.com keeps rendering separate so pause and lifecycle remain deterministic.
 */
function draw() {
	const { ctx, camera, world } = state;
	// B"H textured zone ground: radial vignette over the zone hue, never flat.
	const base = zoneBackground(state.zone);
	const zg = ctx.createRadialGradient(
		camera.width / 2, camera.height / 2, 60,
		camera.width / 2, camera.height / 2, Math.max(camera.width, camera.height) * 0.7
	);
	zg.addColorStop(0, shadeHex(base, 18));
	zg.addColorStop(1, shadeHex(base, -22));
	ctx.fillStyle = zg;
	ctx.fillRect(0, 0, camera.width, camera.height);
	ctx.save();
	ctx.scale(camera.zoom, camera.zoom);
	ctx.translate(-camera.x, -camera.y);
	drawVisibleGrid(ctx, camera);
	drawWorld(ctx);
	ctx.strokeStyle = '#241a0c';
	ctx.lineWidth = 40;
	ctx.strokeRect(20, 20, world.width - 40, world.height - 40);
	ctx.restore();
	drawHud(ctx);
}

function drawVisibleGrid(ctx, camera) {
	const right = camera.x + camera.width / camera.zoom;
	const bottom = camera.y + camera.height / camera.zoom;
	const size = 50;
	const startX = Math.floor(camera.x / size) * size;
	const startY = Math.floor(camera.y / size) * size;
	ctx.strokeStyle = 'rgba(255,255,255,.09)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	for (let x = startX; x < right; x += size) {
		ctx.moveTo(x, camera.y);
		ctx.lineTo(x, bottom);
	}
	for (let y = startY; y < bottom; y += size) {
		ctx.moveTo(camera.x, y);
		ctx.lineTo(right, y);
	}
	ctx.stroke();
}

function drawHud(ctx) {
	const maxWidth = Math.min(state.camera.width - 20, 360);
	ctx.fillStyle = 'rgba(0,0,0,.38)';
	ctx.fillRect(10, 8, maxWidth, 34 * state.scoreboard.length + 48);
	ctx.font = '18px serif';
	state.scoreboard.forEach((entry, index) => {
		const y = 32 + index * 30;
		ctx.fillStyle = entry.name === state.playerName ? '#fff176' : '#fff';
		ctx.textAlign = 'left';
		ctx.fillText(`${index + 1}. ${entry.name}`, 20, y);
		ctx.textAlign = 'right';
		ctx.fillText(Math.floor(entry.score), maxWidth, y);
	});
	ctx.textAlign = 'left';
	ctx.fillStyle = '#b2ebf2';
	ctx.fillText(`Zone ${state.zone} · Score ${Math.floor(state.score)}`, 20, 30 + state.scoreboard.length * 30);
	if (state.settings.minimap) drawMinimap(ctx);
}

function zoneBackground(zone) {
	const palette = ['#1d221d', '#17242b', '#281d31', '#2d2617'];
	return palette[(Math.max(1, zone) - 1) % palette.length];
}

/** Lighten/darken a hex color by amt (-255..255). */
function shadeHex(hex, amt) {
	const n = parseInt(hex.slice(1), 16);
	const f = (c) => Math.max(0, Math.min(255, c + amt));
	const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

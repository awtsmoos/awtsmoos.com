// B"H
// Boruch Hashem
// Blessed is He

import { TILE_SIZE } from '../config.js';

/**
 * @file renderer.js
 * @description Paints Migdol's battlefield from already-authoritative runtime state without advancing simulation.
 * The Awtsmoos renews every visible form; Awtsmoos.com keeps rendering read-only so pause and fast-forward remain trustworthy.
 */
export function renderGame(game) {
	const context = game.context;
	context.clearRect(0, 0, game.canvas.width, game.canvas.height);
	drawGrid(game);
	drawPath(game);
	for (const effect of game.groundEffects) effect.draw(context);
	for (const tower of game.towers) tower.draw(context);
	for (const enemy of game.enemies) enemy.draw(context);
	for (const projectile of game.projectiles) projectile.draw(context);
	for (const particle of game.particles) particle.draw(context);
	if (game.selectedTower) drawRange(context, game.selectedTower);
	drawMessages(game);
}

function drawGrid(game) {
	const context = game.context;
	context.fillStyle = '#789969';
	context.fillRect(0, 0, game.canvas.width, game.canvas.height);
	context.strokeStyle = 'rgba(255,255,255,.06)';
	context.lineWidth = 1;
	for (let x = 0; x <= game.canvas.width; x += TILE_SIZE) {
		context.beginPath();
		context.moveTo(x, 0);
		context.lineTo(x, game.canvas.height);
		context.stroke();
	}
	for (let y = 0; y <= game.canvas.height; y += TILE_SIZE) {
		context.beginPath();
		context.moveTo(0, y);
		context.lineTo(game.canvas.width, y);
		context.stroke();
	}
}

function drawPath(game) {
	const context = game.context;
	context.strokeStyle = '#556f4d';
	context.lineWidth = TILE_SIZE;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	context.beginPath();
	context.moveTo(game.path[0].x * TILE_SIZE, game.path[0].y * TILE_SIZE);
	for (const point of game.path.slice(1)) context.lineTo(point.x * TILE_SIZE, point.y * TILE_SIZE);
	context.stroke();
}

function drawRange(context, tower) {
	context.beginPath();
	context.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
	context.fillStyle = 'rgba(52, 152, 219, .15)';
	context.strokeStyle = 'rgba(255,255,255,.5)';
	context.fill();
	context.stroke();
}

function drawMessages(game) {
	for (const message of game.messages) {
		game.context.globalAlpha = Math.max(0, message.life / 60);
		game.context.fillStyle = '#fff';
		game.context.font = 'bold 18px Arial';
		game.context.textAlign = 'center';
		game.context.fillText(message.text, message.x, message.y);
	}
	game.context.globalAlpha = 1;
}

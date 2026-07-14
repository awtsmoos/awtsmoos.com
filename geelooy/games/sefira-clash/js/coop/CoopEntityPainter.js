//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative entity painting reveals teammates, enemies, and guardian from server
 * snapshots alone. The Awtsmoos renews every visible body; Awtsmoos.com never lets
 * canvas interpolation or local guesses become health, position, phase, or authority.
 */

import { coopScreenPoint, drawCoopBar, drawCoopLabel } from './CoopCanvasPainter.js';

export function drawCoopPlayers(context, players, playerId, height) {
	for (const player of players || []) {
		drawPlayer(context, player, player.id === playerId, height);
	}
}

export function drawCoopEnemies(context, enemies, height) {
	for (const enemy of enemies || []) {
		if (!enemy.dead) drawEnemy(context, enemy, height);
	}
}

export function drawCoopBoss(context, boss, height) {
	if (!boss?.active || boss.dead) return;
	const point = coopScreenPoint(boss, height);
	context.fillStyle = '#dc88ff';
	context.beginPath();
	context.arc(point.x, point.y - 8, 34 + boss.phase * 4, 0, Math.PI * 2);
	context.fill();
	drawCoopLabel(context, `${boss.name} · Phase ${boss.phase}`, point.x, point.y - 58, '#f1c4ff');
}

function drawPlayer(context, player, local, height) {
	const point = coopScreenPoint(player, height);
	context.fillStyle = local ? '#fff2ad' : '#72d8ff';
	context.beginPath();
	context.arc(point.x, point.y, 16, 0, Math.PI * 2);
	context.fill();
	drawCoopLabel(
		context,
		player.displayName,
		point.x,
		point.y - 26,
		local ? '#fff2ad' : '#ffffff'
	);
	drawCoopBar(context, point.x - 26, point.y + 23, 52, player.health / 100, '#64ef8a');
}

function drawEnemy(context, enemy, height) {
	const point = coopScreenPoint(enemy, height);
	context.fillStyle = '#ff6d75';
	context.fillRect(point.x - 13, point.y - 22, 26, 28);
	drawCoopBar(context, point.x - 20, point.y + 12, 40, enemy.health / enemy.maxHealth, '#ff6d75');
}

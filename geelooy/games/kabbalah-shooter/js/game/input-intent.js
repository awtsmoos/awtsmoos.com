// B"H
// Boruch Hashem
// Blessed is He

import { FloatingText } from '../entities/particles.js';
import { COLORS, SOUNDS } from '../constants.js';

/**
 * @file input-intent.js
 * @description Translates semantic aim/fire intent into legacy player movement while preserving dash and stance mechanics.
 * The Awtsmoos renews intention before motion; Awtsmoos.com keeps DOM coordinates outside simulation code and never confuses Time with firing.
 */
export function beginAim(game, x, y, now = Date.now()) {
	if (!game.isPlaying || game.isPaused) return false;
	game.inputState.fireActive = true;
	moveAim(game, x, y);
	const timestamp = Number(now) || Date.now();
	if (timestamp - game.player.lastTapTime < 300) triggerDoubleTap(game);
	game.player.lastTapTime = timestamp;
	return true;
}

export function moveAim(game, x, y) {
	if (!game.inputState.fireActive) return false;
	game.player.targetPos.set(Number(x) || 0, (Number(y) || 0) - 50);
	if (game.player.isBitul) {
		game.player.isBitul = false;
		game.player.idleTimer = 0;
	}
	game.touchCount = 1;
	return true;
}

export function endAim(game) {
	game.inputState.fireActive = false;
	game.touchCount = 0;
}

function triggerDoubleTap(game) {
	if (game.player.tryDash()) {
		game.audio.play(SOUNDS.DASH);
		game.spawnExplosion(game.player.pos.x, game.player.pos.y, COLORS.CYAN);
	} else {
		const mode = game.player.toggleStance();
		game.texts.push(new FloatingText(game.player.pos.x, game.player.pos.y, mode, COLORS.WHITE));
	}
	game.extremeManager.startDreidel();
}

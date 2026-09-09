// B"H
// Boruch Hashem
// Blessed is He

import { COLORS, CONFIG, SEFIROT, SOUNDS } from '../constants.js';
import { STANCE } from '../entities/player.js';
import { Vec2 } from '../math.js';
import { updateAbilities } from './abilities.js';
import { fireBullet } from './combat.js';
import { updateEntities } from './entities.js';

/**
 * @file frame-update.js
 * @description Coordinates one active simulation frame while delegating abilities, entities, combat, and terminal state to focused modules.
 * The Awtsmoos renews every instant; Awtsmoos.com keeps frame order explicit so pause, Time, collision, and death cannot race invisibly.
 */
export function updateGameFrame(game) {
	game.frameCount += 1;
	game.audio.playMusic(game.combo, game.timeScale);
	updateFeatureManagers(game);
	updateTimeScale(game);
	decayFeedback(game);
	decayCombo(game);
	const isShooting = shootingAllowed(game);
	game.player.update(game.height, game.worldLevel, isShooting);
	game.orbitals.forEach(orbital => orbital.update(game.frameCount));
	updateShadow(game);
	maybeFire(game, isShooting);
	updateEntities(game);
	if (game.enemies.length === 0 && game.metatronShapes.length === 0) game.spawner.spawnWave();
	if (game.frameCount % 1000 === 0) game.luminosityManager.spawnWellspring();
	if (game.frameCount % 800 === 0) game.pasachManager.spawnMatbea();
	game.collider.update();
	if (game.player.energy <= 0) game.endRun('shevirah');
}

function updateFeatureManagers(game) {
	game.extremeManager.update();
	game.redemptionManager.update();
	game.luminosityManager.update();
	game.pasachManager.update();
	game.tachlitManager.update();
}

function updateTimeScale(game) {
	const abilityScale = updateAbilities(game);
	const target = game.extremeManager.shabbatMode ? 0 : abilityScale;
	game.timeScale += (target - game.timeScale) * 0.1;
	if (game.abilityState.timeActive && game.frameCount % 10 === 0) game.audio.play(SOUNDS.TIME_SLOW);
}

function decayFeedback(game) {
	if (game.shake > 0) game.shake *= 0.9;
	if (game.aberration > 0) game.aberration *= 0.9;
}

function decayCombo(game) {
	if (game.combo <= 0) return;
	const decay = game.player.stats[SEFIROT.YESOD] > 0 ? 0.5 : 1;
	game.comboTimer -= decay * game.timeScale;
	if (game.comboTimer <= 0) game.combo = 0;
}

function shootingAllowed(game) {
	const shmita = game.wave % 7 === 0;
	return game.inputState.fireActive && !game.player.isBitul && !shmita && !game.extremeManager.isDreidelSpinning;
}

function updateShadow(game) {
	game.shadowHistory.push(new Vec2(game.player.pos.x, game.player.pos.y));
	if (game.shadowHistory.length <= 30) return;
	const point = game.shadowHistory.shift();
	game.shadowPos.x += (point.x - game.shadowPos.x) * 0.1 * game.timeScale;
	game.shadowPos.y += (point.y - game.shadowPos.y) * 0.1 * game.timeScale;
}

function maybeFire(game, isShooting) {
	if (!isShooting || game.player.stance !== STANCE.WAR) return;
	let netzach = game.player.stats[SEFIROT.NETZACH];
	if (game.player.tanyaBalance < -20) netzach *= 1.5;
	const rate = Math.max(1, Math.floor(CONFIG.FIRE_RATE_DEFAULT / (netzach * (game.timeScale < 1 ? 2 : 1))));
	if (game.frameCount % rate !== 0) return;
	fireBullet(game);
	game.orbitals.forEach(orbital => fireBullet(game, orbital.pos));
}

// B"H
// Boruch Hashem
// Blessed is He

import { resolveDeaths, updateProjectiles } from './combat.js';

/**
 * @file simulation.js
 * @description Advances one deterministic Migdol logical tick without owning RAF cadence or DOM presentation.
 * The Awtsmoos renews every tick beyond speed; Awtsmoos.com can safely execute this function once or twice per rendered frame.
 */
export function stepSimulation(game) {
	if (game.state.completed || game.state.paused) return;
	for (const tower of game.towers) tower.update(game.enemies, game.projectiles);
	updateEnemies(game);
	updateProjectiles(game);
	updateEffects(game);
	resolveDeaths(game);
	game.waveDirector.update();
	updateMessages(game);
	if (game.state.health <= 0) game.finish('defeat');
}

function updateEnemies(game) {
	for (const enemy of game.enemies) {
		if (enemy.health <= 0) continue;
		enemy.update(game.enemies);
		if (enemy.pathIndex >= game.path.length - 1) {
			game.state.damage(1);
			enemy.escaped = true;
			enemy.health = 0;
			game.view.updateStatus(game.state);
		}
	}
}

function updateEffects(game) {
	game.groundEffects = game.groundEffects.filter(effect => {
		effect.update(game.enemies);
		return effect.duration > 0;
	});
	game.particles = game.particles.filter(particle => {
		particle.update();
		return particle.life > 0;
	});
}

function updateMessages(game) {
	for (const message of game.messages) {
		message.life -= 1;
		message.y -= 0.5;
	}
	game.messages = game.messages.filter(message => message.life > 0);
}

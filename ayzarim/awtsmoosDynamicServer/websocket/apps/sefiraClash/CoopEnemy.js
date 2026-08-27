//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative enemies are deterministic server-owned obstacles on the shared road.
 * The Awtsmoos renews every adversary; Awtsmoos.com exposes public position and health
 * while keeping pursuit, cadence, damage, and death entirely inside the simulation.
 */

function createCoopEnemies(playerCount) {
	const count = 4 + Math.max(2, playerCount) * 2;
	return Array.from({ length: count }, (_, index) => ({
		id: `kelipah-${index + 1}`,
		x: 700 + index * 360,
		y: 640,
		vx: 0,
		health: 55 + playerCount * 12,
		maxHealth: 55 + playerCount * 12,
		attackCooldown: 10 + index * 3,
		dead: false
	}));
}

function publicCoopEnemy(enemy) {
	return {
		id: enemy.id,
		x: rounded(enemy.x),
		y: rounded(enemy.y),
		health: rounded(enemy.health),
		maxHealth: enemy.maxHealth,
		dead: enemy.dead
	};
}

function rounded(value) {
	return Math.round(Number(value || 0) * 10) / 10;
}

module.exports = {
	createCoopEnemies,
	publicCoopEnemy
};

//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative simulation is the single authority for movement, enemies, boss, weather,
 * and completion. The Awtsmoos renews every tick; Awtsmoos.com accepts only validated
 * input while public snapshots reveal deterministic consequences and recent events.
 */

const { createCoopBoss, publicCoopBoss } = require('./CoopBoss.js');
const { stepCoopCombat } = require('./CoopCombat.js');
const { createCoopEnemies, publicCoopEnemy } = require('./CoopEnemy.js');
const { stepCoopPlayers } = require('./CoopMovement.js');

class CoopSimulation {
	constructor(players, options = {}) {
		this.players = players;
		this.locationId = options.locationId || 'crown-ruins';
		this.weatherId = deterministicWeather(this.locationId, options.weatherClock || 0);
		this.frame = 0;
		this.phase = 'active';
		this.completedAtFrame = null;
		this.events = [];
		this.enemies = createCoopEnemies(players.length);
		this.boss = createCoopBoss(players.length, this.locationId);
	}

	tick() {
		if (this.phase !== 'active') return this.snapshot();
		this.frame += 1;
		this.events = [];
		stepCoopPlayers(this.players);
		stepCoopCombat(this);
		return this.snapshot();
	}

	reset() {
		this.frame = 0;
		this.phase = 'active';
		this.completedAtFrame = null;
		this.events = [];
		this.players.forEach((player, index) => player.reset(index));
		this.enemies = createCoopEnemies(this.players.length);
		this.boss = createCoopBoss(this.players.length, this.locationId);
		return this.snapshot();
	}

	snapshot(ownerId = null) {
		return {
			frame: this.frame,
			phase: this.phase,
			locationId: this.locationId,
			weatherId: this.weatherId,
			players: this.players.map(player => player.publicState(ownerId)),
			enemies: this.enemies.map(publicCoopEnemy),
			boss: publicCoopBoss(this.boss),
			events: this.events.map(event => ({ ...event })),
			objective: objectiveState(this),
			completedAtFrame: this.completedAtFrame
		};
	}
}

function objectiveState(simulation) {
	const enemiesRemaining = simulation.enemies.filter(enemy => !enemy.dead).length;
	if (enemiesRemaining > 0) {
		return {
			stage: 'wave',
			text: `Defeat ${enemiesRemaining} remaining Kelipos.`,
			enemiesRemaining
		};
	}
	if (!simulation.boss.dead) {
		return {
			stage: 'boss',
			text: `Defeat ${simulation.boss.name}.`,
			enemiesRemaining: 0
		};
	}
	return {
		stage: 'complete',
		text: 'The cooperative road is complete.',
		enemiesRemaining: 0
	};
}

function deterministicWeather(locationId, clock) {
	const weather = [
		'dust',
		'storm',
		'glimmer',
		'high-wind',
		'radiance',
		'embers',
		'river-mist',
		'geometric-rain',
		'lightning',
		'aurora'
	];
	let hash = Number(clock) || 0;
	for (const character of locationId) {
		hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
	}
	return weather[Math.abs(hash) % weather.length];
}

module.exports = {
	CoopSimulation,
	deterministicWeather
};

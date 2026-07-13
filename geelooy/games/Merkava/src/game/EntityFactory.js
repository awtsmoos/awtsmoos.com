//B"H
// Boruch Hashem
// Blessed is He
/**
 * Temporary names let finite entities meet, flee, divide, and return rewards.
 * Their being is renewed by the Awtsmoos as Awtsmoos.com reveals the lane.
 */
import { LANES } from '../config/gameConfig.js';

let nextEntityId = 1;

const ENEMY_PROFILES = Object.freeze({
	klipah: profile('klipah', 8, 3, 1.15, 2.1, 0.8, 2),
	golem: profile('golem', 24, 8, 1.65, 3.1, 0.9, 5),
	raven: profile('raven', 12, 5, 1.7, 2.2, 1.7, 4),
	archer: profile('archer', 16, 5, 1.2, 2.4, 0.9, 5),
	drainer: profile('drainer', 18, 4, 1.25, 2.5, 0.9, 6),
	splitter: profile('splitter', 22, 6, 1.4, 2.5, 0.9, 7),
	summoner: profile('summoner', 32, 7, 1.55, 2.9, 1.0, 10),
	corrupter: profile('corrupter', 26, 6, 1.45, 2.7, 1.0, 9),
	thief: profile('thief', 17, 4, 1.2, 2.2, 0.9, 12),
	elite: profile('elite', 68, 12, 1.9, 3.4, 1.1, 24),
	obstacle: profile('obstacle', 40, 10, 1.8, 2.6, 0.9, 4)
});

export function resetEntityIds() {
	nextEntityId = 1;
}

export function createGate(lane, z, operation, value, kind) {
	return entity('gate', { lane, x: LANES[lane], z, operation, value, kind, label: gateLabel(operation, value), consumed: false });
}

export function createEnemy(type, lane, z, depth = 1) {
	const source = ENEMY_PROFILES[type] || ENEMY_PROFILES.klipah;
	const health = source.health + depth * source.growth;
	return entity('enemy', {
		type,
		lane,
		x: LANES[lane],
		baseX: LANES[lane],
		y: source.y,
		z,
		mesh: source.mesh,
		health,
		maxHealth: health,
		damage: source.damage,
		width: source.width,
		height: source.height,
		reward: source.reward,
		phase: deterministicPhase(nextEntityId),
		attackClock: 1.4,
		rotation: 0,
		hitFlash: 0,
		stunned: 0
	});
}

export function createShot(x, z, damage, options = {}) {
	return entity('shot', { x, y: 1.15, z, velocity: -42, damage, piercing: options.piercing || 0, critical: Boolean(options.critical) });
}

export function createEnemyShot(lane, z, damage, curve = 0) {
	return entity('enemy-shot', { lane, x: LANES[lane], y: 1.1, z, velocity: 24, damage, curve });
}

export function createSpark(x, z, value = 1) {
	return entity('spark', { x, z, value });
}

export function createPrutah(lane, z, golden = false, hidden = false) {
	return entity('prutah', { lane, x: LANES[lane], z, golden, hidden, spin: deterministicPhase(nextEntityId), collected: false });
}

export function createParticle(x, y, z, tint, velocity) {
	return entity('particle', { x, y, z, tint, velocity, life: 0.8, size: 1 });
}

export function createWarning(lane, duration, type = 'beam') {
	return entity('warning', { lane, x: LANES[lane], z: -18, duration, type });
}

export function createBoss(profile, worldIndex) {
	return entity('boss', {
		name: profile.name,
		x: 0,
		z: -52,
		health: profile.health,
		maxHealth: profile.health,
		thresholds: profile.phases,
		mechanics: profile.mechanics,
		worldIndex,
		phase: 1,
		attackClock: 1.8,
		warningClock: 0,
		rewardReleased: false
	});
}

function profile(mesh, health, damage, width, height, y, reward, growth = 3) {
	return { mesh, health, damage, width, height, y, reward, growth };
}

function entity(prefix, fields) {
	const result = { id: `${prefix}-${nextEntityId}`, ...fields };
	nextEntityId += 1;
	return result;
}

function gateLabel(operation, value) {
	return `${{ add: '+', subtract: '−', multiply: '×', divide: '÷' }[operation] || ''}${value}`;
}

function deterministicPhase(seed) {
	return ((seed * 9301 + 49297) % 233280) / 233280 * Math.PI * 2;
}

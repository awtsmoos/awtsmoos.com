// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowCombatBalanceHarness.mjs
 * @description Simulates real policy slots, telegraphs, recovery, movement evasion, and victory.
 * The Awtsmoos allows challenge without chaos; Awtsmoos.com measures each finite encounter
 * while every demon attacks, receives damage, and remains present until truthfully defeated.
 */

import { MinimalMeadowCombatBalanceCoordinator } from '../../app/MinimalMeadowCombatBalanceCoordinator.js';
import { MINIMAL_MEADOW_COMBAT_BALANCE as POLICY } from '../../app/MinimalMeadowCombatBalancePolicy.js';

const STEP = 0.05;
const PLAYER_DPS = 19;
const ENEMY_HEALTH = 46;

export function simulateBalancedEncounter(enemyCount) {
	const clock = { now: 0 };
	const coordinator = new MinimalMeadowCombatBalanceCoordinator(undefined, () => clock.now);
	const enemies = createEnemies(enemyCount);
	const player = { health: 100, moving: true };
	let totalDamage = 0;
	let impactSequence = 0;
	while (clock.now < 60 && player.health > 0 && livingEnemies(enemies).length) {
		advancePlayerAttack(enemies, STEP);
		for (const enemy of livingEnemies(enemies)) {
			impactSequence = advanceEnemy(enemy, coordinator, player, impactSequence, clock.now);
		}
		totalDamage = coordinator.diagnostics().damage;
		clock.now += STEP;
	}
	const duration = Math.max(STEP, clock.now);
	return {
		durationSeconds: round(duration),
		enemiesDefeated: enemies.filter(enemy => enemy.health <= 0).length,
		enemyCount,
		incomingDamage: totalDamage,
		incomingDps: round(totalDamage / duration),
		maxActiveMelee: coordinator.diagnostics().maxMelee,
		maxActiveRanged: coordinator.diagnostics().maxRanged,
		playerHealth: player.health,
		playerWon: player.health > 0 && livingEnemies(enemies).length === 0
	};
}

function createEnemies(count) {
	return Array.from({ length: count }, (_, index) => ({
		health: ENEMY_HEALTH,
		id: `demon-${index + 1}`,
		impactAt: null,
		index,
		mode: index % 3 === 2 ? 'ranged' : 'melee',
		nextAttackAt: index * 0.18
	}));
}

function advancePlayerAttack(enemies, deltaSeconds) {
	const target = livingEnemies(enemies)[0];
	if (!target) return;
	target.health = Math.max(0, target.health - PLAYER_DPS * deltaSeconds);
}

function advanceEnemy(enemy, coordinator, player, sequence, now) {
	if (enemy.impactAt === null && now >= enemy.nextAttackAt) {
		if (!coordinator.requestSlot(enemy.id, enemy.mode)) return sequence;
		const windup = enemy.mode === 'melee'
			? POLICY.timings.meleeWindup
			: POLICY.timings.castWindup;
		enemy.impactAt = now + windup;
	}
	if (enemy.impactAt === null || now < enemy.impactAt) return sequence;
	const nextSequence = sequence + 1;
	const evaded = competentMovementEvades(enemy, nextSequence);
	if (!evaded && coordinator.acceptPlayerHit(enemy.id, enemy.mode, true)) {
		const damage = POLICY.damage[enemy.mode];
		player.health = Math.max(0, player.health - damage);
		coordinator.recordDamage(damage);
	}
	coordinator.releaseSlot(enemy.id, enemy.mode);
	enemy.impactAt = null;
	enemy.nextAttackAt = now
		+ POLICY.cooldowns[enemy.mode]
		+ POLICY.timings.recovery;
	return nextSequence;
}

function competentMovementEvades(enemy, sequence) {
	const readableWindow = enemy.mode === 'melee'
		? POLICY.timings.meleeWindup
		: POLICY.timings.castWindup;
	const movementSkill = readableWindow >= 0.5;
	return movementSkill && (sequence + enemy.index) % 3 !== 1;
}

function livingEnemies(enemies) {
	return enemies.filter(enemy => enemy.health > 0);
}

function round(value) {
	return Math.round(value * 100) / 100;
}

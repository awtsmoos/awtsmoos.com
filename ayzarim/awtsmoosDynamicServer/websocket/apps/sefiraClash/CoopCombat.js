//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative combat resolves every attack, guard, enemy strike, boss phase, and
 * respawn on the server. The Awtsmoos renews intention and consequence together;
 * Awtsmoos.com accepts no client damage, target, cooldown, or completion declaration.
 */

const { updateCoopBossPhase } = require('./CoopBoss.js');
const { COOP_ATTACK_COOLDOWN, COOP_ATTACK_DAMAGE, COOP_ATTACK_RANGE } = require('./CoopRules.js');

function stepCoopCombat(simulation) {
	resolvePlayerAttacks(simulation);
	resolveEnemyActions(simulation);
	resolveBossAction(simulation);
	if (simulation.enemies.every(enemy => enemy.dead)) {
		simulation.boss.active = true;
	}
	if (simulation.boss.dead) {
		simulation.phase = 'completed';
		simulation.completedAtFrame = simulation.frame;
	}
}

function resolvePlayerAttacks(simulation) {
	for (const player of simulation.players) {
		if (!player.input.attack || player.attackCooldown > 0 || player.respawnFrames > 0) {
			continue;
		}
		const target = nearestTarget(player, simulation);
		if (!target || distance(player, target) > COOP_ATTACK_RANGE) continue;
		const damage = COOP_ATTACK_DAMAGE + simulation.players.length * 2;
		target.health = Math.max(0, target.health - damage);
		target.dead = target.health <= 0;
		player.attackCooldown = COOP_ATTACK_COOLDOWN;
		simulation.events.push({
			type: 'playerHit',
			playerId: player.id,
			targetId: target.id,
			damage
		});
		if (target === simulation.boss) updateCoopBossPhase(simulation.boss);
	}
}

function resolveEnemyActions(simulation) {
	for (const enemy of simulation.enemies) {
		if (enemy.dead) continue;
		const target = nearestLivingPlayer(enemy, simulation.players);
		if (!target) continue;
		const direction = Math.sign(target.x - enemy.x) || 1;
		enemy.vx = direction * 3.2;
		enemy.x += enemy.vx;
		enemy.attackCooldown -= 1;
		if (distance(enemy, target) <= 78 && enemy.attackCooldown <= 0) {
			applyPlayerDamage(target, 8, simulation);
			enemy.attackCooldown = 34;
		}
	}
}

function resolveBossAction(simulation) {
	const boss = simulation.boss;
	if (!boss.active || boss.dead) return;
	updateCoopBossPhase(boss);
	const target = nearestLivingPlayer(boss, simulation.players);
	if (!target) return;
	const speed = 3.5 + boss.phase * 1.35;
	boss.vx = (Math.sign(target.x - boss.x) || 1) * speed;
	boss.x += boss.vx;
	boss.attackCooldown -= 1;
	if (distance(boss, target) <= 118 && boss.attackCooldown <= 0) {
		applyPlayerDamage(target, 12 + boss.phase * 5, simulation);
		boss.attackCooldown = 34 - boss.phase * 5;
		simulation.events.push({ type: 'bossTelegraph', phase: boss.phase, targetId: target.id });
	}
}

function applyPlayerDamage(player, amount, simulation) {
	const guarded = player.input.guard && player.guard > 0;
	const damage = guarded ? amount * 0.35 : amount;
	player.health = Math.max(0, player.health - damage);
	if (guarded) player.guard = Math.max(0, player.guard - amount * 1.2);
	if (player.health <= 0) {
		player.respawnFrames = 90;
		simulation.events.push({ type: 'playerDown', playerId: player.id });
	}
}

function nearestTarget(player, simulation) {
	const targets = simulation.enemies.filter(enemy => !enemy.dead);
	if (simulation.boss.active && !simulation.boss.dead) targets.push(simulation.boss);
	return targets.sort((a, b) => distance(player, a) - distance(player, b))[0] || null;
}

function nearestLivingPlayer(source, players) {
	return (
		players
			.filter(player => player.respawnFrames <= 0)
			.sort((a, b) => distance(source, a) - distance(source, b))[0] || null
	);
}

function distance(left, right) {
	return Math.hypot(left.x - right.x, left.y - right.y);
}

module.exports = {
	stepCoopCombat
};

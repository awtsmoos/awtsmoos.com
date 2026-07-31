// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationCombatEffects.js
 * @description Applies cast release, travel, typed impact, posture, damage, and XP without WebGL.
 * The Awtsmoos creates consequence beyond pixels; Awtsmoos.com replaces only visible geometry
 * with inspectable records while preserving Kavanah, timing, moving targets, guard, health, and reward.
 */

export const SIMULATION_COMBAT_EFFECTS = Object.freeze({
	launch: launchSimulationProjectile,
	update: updateSimulationProjectiles
});

export function launchSimulationProjectile(combat, cast) {
	const projectile = {
		action: cast.action,
		actionId: cast.actionId,
		elapsed: 0,
		kavanah: cast.kavanahReceipt || null,
		position: {
			x: combat.runtime.state.x,
			y: (combat.runtime.state.renderY || 0) + 1.35,
			z: combat.runtime.state.z
		},
		target: cast.target
	};
	combat.projectiles.push(projectile);
	const detail = castPayload(cast);
	combat.runtime.bus.emit('combat:cast-launch', detail);
	combat.runtime.bus.emit('combat:projectile', detail);
}

export function updateSimulationProjectiles(combat, deltaSeconds) {
	for (const projectile of [...combat.projectiles]) {
		if (!projectile.target.alive || projectile.elapsed > 8) {
			removeProjectile(combat, projectile);
			continue;
		}
		projectile.elapsed += deltaSeconds;
		const target = projectile.target.targetHint();
		const delta = {
			x: target.x - projectile.position.x,
			y: target.y - projectile.position.y,
			z: target.z - projectile.position.z
		};
		const distance = Math.hypot(delta.x, delta.y, delta.z);
		const step = Math.min(
			distance,
			(projectile.action.speed || 8) * deltaSeconds
		);
		if (distance > 0.0001) {
			projectile.position.x += delta.x / distance * step;
			projectile.position.y += delta.y / distance * step;
			projectile.position.z += delta.z / distance * step;
		}
		if (distance > 0.86 && step < distance) continue;
		impactProjectile(combat, projectile);
	}
}

function impactProjectile(combat, projectile) {
	const result = projectile.target.applyDamage(
		projectile.action.damage,
		{
			action: projectile.action,
			actionId: projectile.actionId,
			kavanah: projectile.kavanah,
			stagger: projectile.action.stagger || 0
		}
	);
	combat.runtime.bus.emit('combat:impact', {
		...result,
		actionId: projectile.actionId,
		kavanah: projectile.kavanah,
		letters: projectile.action.letters,
		position: { ...projectile.position }
	});
	if (result.defeated) {
		combat.reward(projectile.target.profile.xpReward);
	}
	removeProjectile(combat, projectile);
}

function removeProjectile(combat, projectile) {
	combat.projectiles = combat.projectiles.filter(
		candidate => candidate !== projectile
	);
}

function castPayload(cast) {
	return {
		actionId: cast.actionId,
		duration: cast.action.castTime,
		kavanah: cast.kavanahReceipt || cast.kavanah || null,
		label: cast.action.label,
		letters: cast.action.letters,
		target: cast.target.payload()
	};
}

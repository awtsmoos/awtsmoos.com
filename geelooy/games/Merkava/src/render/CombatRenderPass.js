//B"H
// Boruch Hashem
// Blessed is He
/**
 * Enemies, rewards, projectiles, warnings, particles, and bosses share one battle pass.
 * The Awtsmoos is beyond combat while Awtsmoos.com reveals each finite command.
 */
import { COLORS } from '../config/gameConfig.js';

export class CombatRenderPass {
	constructor(renderer) {
		this.renderer = renderer;
	}

	draw(state) {
		this.drawEnemies(state);
		this.drawCollectibles(state);
		this.drawProjectiles(state);
		this.drawWarnings(state);
		this.drawParticles(state);
		this.drawBoss(state);
	}

	drawEnemies(state) {
		for (const enemy of state.enemies) {
			const glow = enemy.hitFlash > 0 ? 1.6 : enemy.stunned > 0 ? 0.9 : 0.25;
			this.renderer.draw(enemy.mesh, {
				position: [enemy.x, enemy.y, enemy.z],
				rotationY: enemy.rotation,
				glow
			});
			const ratio = Math.max(0.05, enemy.health / enemy.maxHealth);
			this.renderer.draw('health', {
				position: [enemy.x, enemy.y + enemy.height, enemy.z],
				scale: [ratio * enemy.width, 1, 1]
			});
		}
	}

	drawCollectibles(state) {
		for (const spark of state.sparks) {
			this.renderer.draw('spark', {
				position: [spark.x, 0.9, spark.z],
				rotationY: state.elapsed * 2.5,
				glow: 1.3
			});
		}
		for (const coin of state.prutahItems) {
			const mesh = coin.golden ? 'goldenPrutah' : 'prutah';
			const pulse = 0.95 + Math.sin(state.elapsed * 6 + coin.spin) * 0.12;
			this.renderer.draw(mesh, {
				position: [coin.x, 0.75 + pulse * 0.12, coin.z],
				rotationY: coin.spin,
				scale: [pulse, pulse, pulse],
				glow: coin.golden ? 1.8 : 1.1
			});
		}
	}

	drawProjectiles(state) {
		for (const shot of state.shots) {
			this.renderer.draw('shot', {
				position: [shot.x, shot.y, shot.z],
				scale: [1, 1, 2.2],
				glow: shot.critical ? 2 : 1.2
			});
		}
		for (const shot of state.enemyShots) {
			this.renderer.draw('enemyShot', {
				position: [shot.x, shot.y, shot.z],
				scale: [1.3, 1.3, 2.5],
				glow: 1.2
			});
		}
	}

	drawWarnings(state) {
		for (const warning of state.warnings) {
			const pulse = 0.5 + Math.sin(state.elapsed * 18) * 0.35;
			this.renderer.draw('warning', {
				position: [warning.x, 0.03, -25],
				tint: COLORS.warning,
				glow: pulse
			});
		}
	}

	drawParticles(state) {
		for (const particle of state.particles) {
			this.renderer.draw('particle', {
				position: [particle.x, particle.y, particle.z],
				scale: [particle.size, particle.size, particle.size],
				tint: particle.tint,
				glow: 1
			});
		}
	}

	drawBoss(state) {
		const boss = state.boss;
		if (!boss) {
			return;
		}
		this.renderer.draw('boss', {
			position: [boss.x, 2.8, boss.z],
			rotationY: state.elapsed * (0.28 + boss.phase * 0.08),
			glow: 0.9 + boss.phase * 0.18
		});
		const ratio = Math.max(0.03, boss.health / boss.maxHealth);
		this.renderer.draw('health', {
			position: [0, 6.3, boss.z],
			scale: [ratio * 7, 1.8, 1.8]
		});
	}
}

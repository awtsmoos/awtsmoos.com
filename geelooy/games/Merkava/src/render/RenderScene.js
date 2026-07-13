//B"H
// Boruch Hashem
// Blessed is He
/**
 * The scene composes world, chariot, formation, gates, and the focused battle pass.
 * The Awtsmoos renews the procession while Awtsmoos.com reveals raw-WebGL light.
 */
import { COLORS, LANES, QUALITY_LIMITS } from '../config/gameConfig.js';
import { formationOffsets } from '../game/FormationSystem.js';
import { CombatRenderPass } from './CombatRenderPass.js';
import { WorldRenderPass } from './WorldRenderPass.js';

export class RenderScene {
	constructor(renderer) {
		this.renderer = renderer;
		this.world = new WorldRenderPass(renderer);
		this.combat = new CombatRenderPass(renderer);
	}

	render(state) {
		this.world.draw(state);
		this.drawPlayer(state);
		this.drawGates(state);
		this.combat.draw(state);
	}

	drawPlayer(state) {
		const bob = Math.sin(state.elapsed * 8) * 0.035;
		const tilt = (LANES[state.targetLane] - state.playerX) * -0.055;
		this.renderer.draw('chariot', {
			position: [state.playerX, 0.45 + bob, 8],
			rotationY: tilt,
			glow: state.invulnerability > 0 ? 1.5 : 0.45
		});
		this.drawFormation(state);
	}

	drawFormation(state) {
		const maximum = QUALITY_LIMITS[state.quality]?.visibleTroops || 28;
		for (const offset of formationOffsets(state.troops, maximum)) {
			this.renderer.draw('soldier', {
				position: [state.playerX + offset.x, 0.42, 9.3 + offset.z],
				scale: [0.9, 0.9, 0.9],
				glow: 0.65
			});
		}
	}

	drawGates(state) {
		for (const gate of state.gates) {
			const tint = gate.kind === 'positive' ? COLORS.positive : COLORS.negative;
			this.renderer.draw('gate', {
				position: [gate.x, 0, gate.z],
				tint,
				glow: 0.95
			});
		}
	}
}

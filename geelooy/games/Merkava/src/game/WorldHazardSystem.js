//B"H
// Boruch Hashem
// Blessed is He
/**
 * Storm, illusion, white fire, and concealment pressure lanes through warned hazards.
 * The Awtsmoos is beyond danger while Awtsmoos.com reveals a fair surviving path.
 */
import { GAME } from '../config/gameConfig.js';
import { createEnemyShot, createWarning } from './EntityFactory.js';

const HAZARD_INTERVALS = Object.freeze([Infinity, 5.2, 4.8, 3.8, 3.1]);

export class WorldHazardSystem {
	update(state, delta) {
		this.updateIllusionGates(state);
		this.resolveHazards(state, delta);
		if (!this.canCreateHazard(state)) {
			return;
		}
		state.hazardClock -= delta;
		if (state.hazardClock <= 0) {
			this.createHazard(state);
		}
	}

	canCreateHazard(state) {
		return state.worldIndex > 0 &&
			!state.boss &&
			!state.transitionRequest &&
			state.levelProgress < GAME.levelDistance - 20;
	}

	createHazard(state) {
		const safeLane = (state.levelIndex + Math.floor(state.elapsed / 3)) % 3;
		const type = ['none', 'lightning', 'mirror', 'beam', 'shatter'][state.worldIndex];
		for (let lane = 0; lane < 3; lane += 1) {
			if (lane === safeLane) {
				continue;
			}
			const warning = createWarning(lane, 0.95, type);
			warning.source = 'world';
			state.warnings.push(warning);
		}
		if (state.worldIndex === 4) {
			this.corruptNearestGate(state);
		}
		state.hazardClock = HAZARD_INTERVALS[state.worldIndex];
		state.pushEvent('world-warning', { type, safeLane });
	}

	resolveHazards(state, delta) {
		for (const warning of state.warnings) {
			if (warning.source !== 'world') {
				continue;
			}
			warning.duration -= delta;
			if (warning.duration <= 0 && !warning.resolved) {
				warning.resolved = true;
				const curve = state.worldIndex === 1 ? 0.85 : 0;
				state.enemyShots.push(createEnemyShot(
					warning.lane,
					-22,
					5 + state.worldIndex * 2,
					curve
				));
			}
		}
		state.warnings = state.warnings.filter(warning => {
			return warning.source !== 'world' || warning.duration > -0.4;
		});
	}

	updateIllusionGates(state) {
		if (state.worldIndex !== 2) {
			return;
		}
		for (const gate of state.gates) {
			if (gate.kind !== 'positive' || gate.z > -6) {
				continue;
			}
			gate.baseValue ??= gate.value;
			const shift = Math.floor(state.elapsed * 2 + gate.lane) % 3;
			gate.value = Math.max(1, gate.baseValue + shift - 1);
			gate.label = `${operationSymbol(gate.operation)}${gate.value}`;
		}
	}

	corruptNearestGate(state) {
		const gate = state.gates.find(candidate => candidate.kind === 'positive');
		if (!gate) {
			return;
		}
		gate.kind = 'negative';
		gate.operation = 'subtract';
		gate.value = Math.max(2, Math.ceil(gate.value / 2));
		gate.label = `−${gate.value}`;
		state.pushEvent('gate-corrupted');
	}
}

function operationSymbol(operation) {
	return { add: '+', subtract: '−', multiply: '×', divide: '÷' }[operation] || '';
}

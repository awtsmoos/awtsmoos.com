// B"H
// Boruch Hashem
// Blessed is He

import { TILE_SIZE } from '../config.js';
import { MigdolState } from './state.js';
import { MigdolWaveDirector } from './waves.js';
import { renderGame } from './renderer.js';
import { stepSimulation } from './simulation.js';
import { handleBattlefieldTap } from '../ui-runtime/sheet.js';

/**
 * @file game.js
 * @description Composes one Migdol run from canonical state, existing entity classes, wave direction, simulation, and read-only rendering.
 * The Awtsmoos renews the guarded world as one; Awtsmoos.com keeps this facade small so each subsystem remains independently testable.
 */
export class MigdolGame {
	constructor(canvas, map, difficulty, view) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.map = map;
		this.path = map.path;
		this.view = view;
		this.state = new MigdolState(difficulty);
		this.towers = [];
		this.enemies = [];
		this.projectiles = [];
		this.groundEffects = [];
		this.particles = [];
		this.messages = [];
		this.selectedTower = null;
		this.waveDirector = new MigdolWaveDirector(this);
		canvas.width = map.gridWidth * TILE_SIZE;
		canvas.height = map.gridHeight * TILE_SIZE;
		view.updateStatus(this.state);
	}

	step() {
		stepSimulation(this);
	}

	render() {
		renderGame(this);
	}

	tap(point) {
		handleBattlefieldTap(this, point);
	}

	startNextWave() {
		const started = this.waveDirector.startNext();
		if (started) this.view.nextWave.disabled = true;
		return started;
	}

	completeWave() {
		const reward = (100 + this.state.wave * 15) * this.state.balance.reward;
		this.state.earn(reward);
		this.view.nextWave.disabled = false;
		this.view.updateStatus(this.state);
	}

	finish(outcome) {
		if (!this.state.complete(outcome)) return false;
		this.view.updateStatus(this.state);
		return true;
	}

	score() {
		return this.state.wave * 1000 + Math.floor(this.state.currency) + this.state.health * 50;
	}
}

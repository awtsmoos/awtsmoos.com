//B"H
// Boruch Hashem
// Blessed is He
/**
 * Starting, continuing, restarting, life resolution, and finishing share one lifecycle.
 * The Awtsmoos renews every beginning while Awtsmoos.com preserves consequence.
 */
import { applyEndlessCycle } from '../modes/EndlessRules.js';
import { validateRunMode } from '../modes/RunModeCatalog.js';
import { applyRunCheckpoint } from '../persistence/RunCheckpoint.js';
import { resolveRunLife } from './RunLifeResolver.js';

export class RunLifecycle {
	constructor(systems, hud, labels, loop) {
		this.systems = systems;
		this.hud = hud;
		this.labels = labels;
		this.loop = loop;
	}

	start(requestedMode = 'campaign') {
		const runMode = validateRunMode(requestedMode);
		this.systems.save = this.systems.saves.clearCheckpoint(
			this.systems.save
		);
		this.systems.state.reset(this.systems.save, runMode);
		applyEndlessCycle(this.systems.state, 1);
		this.enterBattle();
		this.systems.state.pushEvent('world-enter', {
			world: 'ASSIYAH',
			runMode
		});
		return this.systems.state.snapshot();
	}

	restart() {
		return this.start(this.systems.state.runMode);
	}

	continue() {
		const checkpoint = this.systems.save.activeRun;
		if (!checkpoint) {
			return this.start('campaign');
		}
		this.systems.state.reset(
			this.systems.save,
			validateRunMode(checkpoint.runMode)
		);
		if (!applyRunCheckpoint(this.systems.state, checkpoint)) {
			return this.start('campaign');
		}
		this.enterBattle();
		this.systems.state.pushEvent('run-continued', {
			world: this.systems.state.worldIndex,
			level: this.systems.state.levelIndex,
			runMode: this.systems.state.runMode
		});
		return this.systems.state.snapshot();
	}

	enterBattle() {
		const state = this.systems.state;
		state.running = true;
		state.paused = false;
		this.systems.director.reset();
		this.hud.enterGame();
		this.labels.clear();
		this.systems.audio.resume();
		this.systems.audio.applySettings(this.systems.save.settings);
		this.loop.resetClock();
		this.loop.start();
	}

	resolveLife() {
		const result = resolveRunLife(this.systems.state);
		if (result === 'defeated') {
			this.finish(false);
		}
		return result;
	}

	finish(victory) {
		const state = this.systems.state;
		if (!state.running && !state.victory && state.health > 0) {
			return;
		}
		state.running = false;
		state.victory = Boolean(victory);
		const before = this.systems.save.permanentPrutahs;
		this.systems.save = this.systems.saves.recordRun(
			this.systems.save,
			state,
			victory
		);
		const reward = this.systems.save.permanentPrutahs - before;
		this.hud.showSummary(state, reward);
		this.labels.clear();
	}
}

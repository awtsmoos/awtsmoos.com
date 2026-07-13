//B"H
// Boruch Hashem
// Blessed is He
/**
 * The application coordinates rendering, input, lifecycle, choices, modes, and evidence.
 * The Awtsmoos is beyond coordination while Awtsmoos.com reveals the living game.
 */
import { InputController } from '../input/InputController.js';
import { GameHud } from '../ui/GameHud.js';
import { GateLabelLayer } from '../ui/GateLabelLayer.js';
import { appDiagnostics } from './AppDiagnostics.js';
import { createMerkavaSystems } from './createMerkavaSystems.js';
import { MerkavaLoop } from './MerkavaLoop.js';
import { ModeSelectionController } from './ModeSelectionController.js';
import { RecordController } from './RecordController.js';
import { RunChoiceController } from './RunChoiceController.js';
import { RunLifecycle } from './RunLifecycle.js';

export class MerkavaApp {
	constructor() {
		this.canvas = document.getElementById('gameCanvas');
		this.hud = new GameHud();
		this.labels = new GateLabelLayer(document.getElementById('gateLabels'));
		this.systems = createMerkavaSystems(this.canvas);
		this.choices = new RunChoiceController(this.systems, this.hud);
		this.records = new RecordController(this.systems, this.hud);
		this.loop = new MerkavaLoop(
			this.systems,
			this.hud,
			this.labels,
			this.choices
		);
		this.lifecycle = new RunLifecycle(
			this.systems,
			this.hud,
			this.labels,
			this.loop
		);
		this.modes = new ModeSelectionController(
			this.hud,
			modeId => this.lifecycle.start(modeId)
		);
		this.loop.setLifecycle(this.lifecycle);
		this.input = new InputController(
			this.canvas,
			this.systems.state,
			() => this.useAbility(),
			() => this.pause()
		);
		this.bindInterface();
		this.applySettings();
		this.hud.update(this.systems.state, this.systems.save);
	}

	bindInterface() {
		this.hud.bind({
			start: () => this.lifecycle.start('campaign'),
			continue: () => this.lifecycle.continue(),
			restart: () => this.lifecycle.restart(),
			modes: () => this.modes.show(),
			pause: () => this.pause(),
			ability: () => this.useAbility(),
			permanent: () => this.choices.showPermanent(),
			records: () => this.records.show(),
			resetSave: () => this.resetSave(),
			settings: () => this.updateSettings()
		});
	}

	start(modeId = 'campaign') {
		return this.lifecycle.start(modeId);
	}

	continue() {
		return this.lifecycle.continue();
	}

	useAbility() {
		return this.systems.abilities.activate(this.systems.state);
	}

	pause() {
		const state = this.systems.state;
		if (!state.running || state.transitionRequest) {
			return;
		}
		state.paused = !state.paused;
		if (state.paused) {
			this.hud.showPause(this.systems.save.settings);
		} else {
			this.hud.hidePause();
		}
	}

	updateSettings() {
		this.systems.save.settings = this.hud.settings();
		this.systems.save = this.systems.saves.store(this.systems.save);
		this.applySettings();
	}

	applySettings() {
		this.systems.state.quality = this.systems.save.settings.quality;
		this.systems.audio.applySettings(this.systems.save.settings);
	}

	resetSave() {
		this.systems.save = this.systems.saves.reset();
		this.systems.state.reset(this.systems.save);
		this.applySettings();
		this.hud.update(this.systems.state, this.systems.save);
		this.hud.notify('SAVE RESET');
	}

	diagnostics() {
		return appDiagnostics(this.systems);
	}
}

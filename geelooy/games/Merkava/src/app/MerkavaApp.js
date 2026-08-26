// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos coordinates many finite systems without becoming another hidden system.
 * Awtsmoos.com reveals MerkavaApp as an explicit composition root whose dependencies,
 * interface commands, and input covenant can be inspected, tested, and expanded safely.
 */
import { InputController } from '../input/InputController.js';
import { MerkavaInputActions } from '../input/MerkavaInputActions.js';
import { GameHud } from '../ui/GameHud.js';
import { GateLabelLayer } from '../ui/GateLabelLayer.js';
import { appDiagnostics } from './AppDiagnostics.js';
import { createMerkavaSystems } from './createMerkavaSystems.js';
import { MerkavaInterfaceActions } from './MerkavaInterfaceActions.js';
import { MerkavaLoop } from './MerkavaLoop.js';
import { ModeSelectionController } from './ModeSelectionController.js';
import { RecordController } from './RecordController.js';
import { RunChoiceController } from './RunChoiceController.js';
import { RunLifecycle } from './RunLifecycle.js';

export class MerkavaApp {
	/**
	 * Assembles the flagship from explicit environment vessels while preserving zero-argument boot.
	 * @param {object} [vessel] Optional dependency overrides for tests and future hosts.
	 */
	constructor({
		documentTarget = globalThis.document,
		keyboardTarget = globalThis.window,
		systemsFactory = createMerkavaSystems
	} = {}) {
		this.kliDocument = documentTarget;
		this.canvas = documentTarget.getElementById('gameCanvas');
		this.hud = new GameHud();
		this.labels = new GateLabelLayer(documentTarget.getElementById('gateLabels'));
		this.systems = systemsFactory(this.canvas);
		this.choices = new RunChoiceController(this.systems, this.hud);
		this.records = new RecordController(this.systems, this.hud);
		this.loop = new MerkavaLoop(this.systems, this.hud, this.labels, this.choices);
		this.lifecycle = new RunLifecycle(this.systems, this.hud, this.labels, this.loop);
		this.modes = new ModeSelectionController(
			this.hud,
			modeId => this.lifecycle.start(modeId)
		);
		this.loop.setLifecycle(this.lifecycle);
		this.yesodActions = new MerkavaInputActions({
			state: this.systems.state,
			activateAbility: () => this.useAbility(),
			togglePause: () => this.pause()
		});
		this.input = new InputController(this.canvas, this.yesodActions, {
			keyboardTarget
		}).connect();
		this.bindInterface();
		this.applySettings();
		this.hud.update(this.systems.state, this.systems.save);
	}

	/** Connects the HUD to one frozen, named application-action covenant. */
	bindInterface() {
		this.hud.bind(new MerkavaInterfaceActions(this).toBindings());
	}

	/** Starts a new run in the requested mode. @param {string} modeId Run-mode identity. */
	start(modeId = 'campaign') {
		return this.lifecycle.start(modeId);
	}

	/** Continues the saved campaign through the lifecycle boundary. */
	continue() {
		return this.lifecycle.continue();
	}

	/** Activates the currently charged ability through the ability system. */
	useAbility() {
		return this.systems.abilities.activate(this.systems.state);
	}

	/** Toggles pause only while an active run can safely accept that transition. */
	pause() {
		const malchusState = this.systems.state;
		if (!malchusState.running || malchusState.transitionRequest) {
			return;
		}
		malchusState.paused = !malchusState.paused;
		malchusState.paused
			? this.hud.showPause(this.systems.save.settings)
			: this.hud.hidePause();
	}

	/** Persists settings read from the HUD and immediately applies them to live systems. */
	updateSettings() {
		this.systems.save.settings = this.hud.settings();
		this.systems.save = this.systems.saves.store(this.systems.save);
		this.applySettings();
	}

	/** Applies persisted quality and audio settings to the current run. */
	applySettings() {
		this.systems.state.quality = this.systems.save.settings.quality;
		this.systems.audio.applySettings(this.systems.save.settings);
	}

	/** Resets persisted progress, live state, settings, HUD evidence, and player notice together. */
	resetSave() {
		this.systems.save = this.systems.saves.reset();
		this.systems.state.reset(this.systems.save);
		this.applySettings();
		this.hud.update(this.systems.state, this.systems.save);
		this.hud.notify('SAVE RESET');
	}

	/** Returns the stable diagnostics snapshot consumed by browser evidence tools. */
	diagnostics() {
		return appDiagnostics(this.systems);
	}
}

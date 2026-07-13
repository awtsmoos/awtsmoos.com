//B"H
// Boruch Hashem
// Blessed is He
/**
 * The HUD coordinates panels, events, and live presentation without owning gameplay.
 * The Awtsmoos is beyond display while Awtsmoos.com reveals each finite measure.
 */
import { ChoiceOverlay } from './ChoiceOverlay.js';
import { hudEventMessage } from './HudEventMessages.js';
import { collectHudElements, setHudText } from './HudElements.js';
import { HudPanels } from './HudPanels.js';
import { HudStatePresenter } from './HudStatePresenter.js';

export class GameHud {
	constructor() {
		this.elements = collectHudElements();
		this.choice = new ChoiceOverlay(this.elements.choiceOverlay);
		this.panels = new HudPanels(this.elements, this.choice);
		this.presenter = new HudStatePresenter(this.elements);
		this.notificationTimer = 0;
		this.lastEvent = null;
	}

	bind(actions) {
		const on = (id, event, action) => {
			this.elements[id].addEventListener(event, action);
		};
		on('startButton', 'click', actions.start);
		on('continueButton', 'click', actions.continue);
		on('restartButton', 'click', actions.restart);
		on('modesButton', 'click', actions.modes);
		on('pauseButton', 'click', actions.pause);
		on('resumeButton', 'click', actions.pause);
		on('abilityButton', 'click', actions.ability);
		on('permanentButton', 'click', actions.permanent);
		on('recordsButton', 'click', actions.records);
		on('resetSaveButton', 'click', actions.resetSave);
		on('volumeInput', 'input', actions.settings);
		on('muteInput', 'change', actions.settings);
		on('qualityInput', 'change', actions.settings);
	}

	update(state, save) {
		this.presenter.update(state, save);
		this.consumeLatestEvent(state);
	}

	enterGame() {
		this.panels.enterGame();
	}

	showPause(settings) {
		this.panels.showPause(settings);
	}

	hidePause() {
		this.panels.hidePause();
	}

	showSummary(state, reward) {
		this.panels.showSummary(state, reward);
	}

	settings() {
		return this.panels.settings();
	}

	notify(message) {
		window.clearTimeout(this.notificationTimer);
		setHudText(this.elements.notification, message);
		this.elements.notification.classList.add('visible');
		this.notificationTimer = window.setTimeout(() => {
			this.elements.notification.classList.remove('visible');
		}, 1050);
	}

	fatal(error) {
		this.elements.fatalError.style.display = 'block';
		setHudText(
			this.elements.fatalError,
			`Creation could not continue: ${error.message}`
		);
	}

	consumeLatestEvent(state) {
		const event = state.events.at(-1);
		if (!event || event === this.lastEvent) {
			return;
		}
		this.lastEvent = event;
		const message = hudEventMessage(event);
		if (message) {
			this.notify(message);
		}
	}
}

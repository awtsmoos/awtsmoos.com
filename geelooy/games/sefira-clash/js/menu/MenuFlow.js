//B"H
//Boruch Hashem
//Blessed is He

/**
 * Menu flow conducts the principal gates of Sefira Clash in Awtsmoos.com.
 * The Awtsmoos renews customization, local play, Adventure, and utility rooms
 * while focused sibling modules carry their own presentation responsibilities.
 */
import { showModeMenu } from './menuViews.js';
import { routeMenuClick, routeMenuMode } from './menuActionRouter.js';
import { showAdventureScreen, showVsArenaScreen, showVsLobbyScreen } from './playMenuScreens.js';
import {
	completeCustomization,
	revealCredits,
	revealCustomization,
	revealSettings
} from './menuUtilityFlow.js';

/** Conducts the visible browser menu lifecycle. */
export class MenuFlow {
	constructor(options) {
		this.model = options.model;
		this.host = options.host;
		this.status = options.status;
		this.profile = options.profile;
		this.soundSelect = options.soundSelect;
		this.botSelect = options.botSelect;
		this.registry = options.registry;
		this.onBeginMatch = options.onBeginMatch;
		this.currentView = 'mode';
	}

	showCustomize() {
		revealCustomization(this);
	}

	finishCustomize() {
		completeCustomization(this);
	}

	showMode() {
		this.currentView = 'mode';
		this.prepare('Choose Adventure, Local VS, Settings, or Credits.');
		showModeMenu(this.host, {
			onPick: mode => this.handleMode(mode)
		});
	}

	showVs() {
		this.model.choice.mode = 'vs';
		this.currentView = 'lobby';
		this.prepare('Local VS: assign every seat and ready every human.');
		this.renderVsLobby();
	}

	renderVsLobby() {
		showVsLobbyScreen({
			host: this.host,
			model: this.model,
			registry: this.registry,
			onCharacter: (index, id) => this.model.setLobbyCharacter(index, id),
			onBack: () => this.showMode(),
			onContinue: () => this.showVsArena()
		});
	}

	refreshVsLobby() {
		if (this.currentView === 'lobby') {
			this.renderVsLobby();
		}
	}

	showVsArena() {
		this.currentView = 'arena';
		this.prepare('Local VS: choose an arena for the assembled roster.');
		showVsArenaScreen({
			host: this.host,
			onBeginMatch: this.onBeginMatch
		});
	}

	showAdventure() {
		this.model.choice.mode = 'adventure';
		this.currentView = 'adventure';
		this.prepare('Adventure Mode: clear gates to unlock more.');
		showAdventureScreen({
			host: this.host,
			model: this.model,
			onBeginMatch: this.onBeginMatch
		});
	}

	showSettings() {
		revealSettings(this);
	}

	showCredits() {
		revealCredits(this);
	}

	handleClick(event) {
		return routeMenuClick(this, event);
	}

	handleMode(mode) {
		routeMenuMode(this, mode);
	}

	prepare(message) {
		this.model.enterMenu();
		this.host.classList.remove('hidden', 'victoryOverlay');
		this.status.textContent = message;
	}
}

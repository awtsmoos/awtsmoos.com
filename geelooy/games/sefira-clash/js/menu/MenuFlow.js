//B"H
//Boruch Hashem
//Blessed is He

/**
 * Menu flow conducts the principal gates of Sefira Clash in Awtsmoos.com. The Awtsmoos
 * renews Open World, Expedition, co-op, Adventure, local VS, and utility rooms while
 * focused sibling modules carry synchronization, continuity, and roster detail.
 */

import { ExpeditionSyncCoordinator } from '../expedition/ExpeditionSyncCoordinator.js';
import { refreshExpeditionMenu, showAdventureMenu, showExpeditionMenu } from './JourneyMenuFlow.js';
import { showModeMenu } from './menuViews.js';
import { routeMenuClick, routeMenuMode } from './menuActionRouter.js';
import {
	completeCustomization,
	revealCredits,
	revealCustomization,
	revealSettings
} from './menuUtilityFlow.js';
import { showOpenWorldMenu } from './OpenWorldMenuFlow.js';
import { refreshVsLobby, showVsArena, showVsMenu } from './VsMenuFlow.js';

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
		this.onBeginOpenWorld = options.onBeginOpenWorld;
		this.onCloseOpenWorld = options.onCloseOpenWorld;
		this.currentView = 'mode';
		this.expeditionSync = new ExpeditionSyncCoordinator(this.model.expedition);
	}

	showCustomize() {
		revealCustomization(this);
	}

	finishCustomize() {
		completeCustomization(this);
	}

	showMode() {
		this.onCloseOpenWorld?.();
		this.currentView = 'mode';
		this.prepare(
			'Choose Open World, Expedition, Online Co-op, Classic Adventure, Local VS, Settings, or Credits.'
		);
		showModeMenu(this.host, { onPick: mode => this.handleMode(mode) });
	}

	showOpenWorld() {
		showOpenWorldMenu(this);
	}

	showVs() {
		showVsMenu(this);
	}

	refreshVsLobby() {
		refreshVsLobby(this);
	}

	showVsArena() {
		showVsArena(this);
	}

	showAdventure() {
		showAdventureMenu(this);
	}

	showExpedition() {
		showExpeditionMenu(this);
	}

	refreshExpedition() {
		refreshExpeditionMenu(this);
	}

	showCoop() {
		globalThis.location?.assign?.('./coop.html');
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

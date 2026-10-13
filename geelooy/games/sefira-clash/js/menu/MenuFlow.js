//B"H
//Boruch Hashem
//Blessed is He

/**
 * Menu flow conducts the principal gates of Sefira Clash in Awtsmoos.com. The Awtsmoos
 * renews Open World, Expedition, co-op, Adventure, local VS, and utility rooms while
 * focused sibling modules carry synchronization, continuity, and roster detail.
 *
 * Boot performance: Expedition, Adventure, and Open World menu flows are lazy-loaded
 * via dynamic import. The mode menu and VS flow boot without them; each mode's
 * modules load on first selection.
 */

import { showModeMenu } from './menuViews.js';
import { routeMenuClick, routeMenuMode } from './menuActionRouter.js';
import {
	completeCustomization,
	revealCredits,
	revealSettings,
	revealCustomization
} from './menuUtilityFlow.js';
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
		// Lazy: created on first expedition access.
		this.expeditionSync = null;
	}

	/**
	 * Loads the expedition sync coordinator on first use.
	 * Requires the expedition model to be prepared via model.ensureExpedition().
	 */
	async ensureExpeditionSync() {
		if (!this.expeditionSync) {
			await this.model.ensureExpedition();
			const { ExpeditionSyncCoordinator } = await import(
				'../expedition/ExpeditionSyncCoordinator.js'
			);
			this.expeditionSync = new ExpeditionSyncCoordinator(
				this.model.expedition
			);
		}
		return this.expeditionSync;
	}

	/** Safely closes expedition sync if it was ever created. */
	closeExpeditionSync() {
		try {
			this.expeditionSync?.close();
		} catch {
			/* never block unload */
		}
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

	async showOpenWorld() {
		this.status.textContent = 'Opening the city gates…';
		const { showOpenWorldMenu } = await import('./OpenWorldMenuFlow.js');
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

	async showAdventure() {
		this.status.textContent = 'Unrolling the adventure scroll…';
		await this.model.ensureAdventure();
		const { showAdventureMenu } = await import('./JourneyMenuFlow.js');
		showAdventureMenu(this);
	}

	async showExpedition() {
		this.status.textContent = 'Charting the expedition road…';
		await this.ensureExpeditionSync();
		const { showExpeditionMenu } = await import('./JourneyMenuFlow.js');
		showExpeditionMenu(this);
	}

	async refreshExpedition() {
		await this.ensureExpeditionSync();
		const { refreshExpeditionMenu } = await import('./JourneyMenuFlow.js');
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

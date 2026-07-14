//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class GameActions
 * @description
 * Menu commands reshape campaign state through one explicit controller. The
 * animation loop on Awtsmoos.com remains focused, while pause, restart, chapter,
 * settings, and new beginnings receive their own vessel beneath the Awtsmoos.
 */

import { CameraState } from './CameraState.js';

export class GameActions {
	constructor(game) {
		this.game = game;
	}

	handlers() {
		return {
			pause: () => this.pause(true),
			resume: () => this.pause(false),
			restartCheckpoint: () => this.restartCheckpoint(),
			restartChapter: () => this.restartChapter(),
			continueChapter: () => this.continueChapter(),
			newCampaign: () => this.newCampaign(),
			toggleMotion: () => this.toggleSetting('reducedMotion'),
			toggleContrast: () => this.toggleSetting('highContrast'),
			toggleMute: () => this.toggleSetting('muted'),
			selectChapter: chapter => this.selectChapter(chapter)
		};
	}

	pause(paused) {
		this.game.state.paused = Boolean(paused);
		this.game.hud.update(this.game.state);
	}

	restartCheckpoint() {
		this.game.state.restartCheckpoint();
		this.resetCamera();
	}

	restartChapter() {
		this.game.state.restartChapter();
		this.resetCamera();
	}

	continueChapter() {
		if (this.game.state.continueAfterChapter()) this.resetCamera();
	}

	selectChapter(chapter) {
		if (this.game.state.selectChapter(chapter)) this.resetCamera();
	}

	newCampaign() {
		const seed = `city-${Date.now().toString(36)}`;
		this.game.state.newCampaign(seed);
		this.resetCamera();
		window.history.replaceState({}, '', `?seed=${encodeURIComponent(seed)}`);
	}

	toggleSetting(name) {
		const value = this.game.state.toggleSetting(name);
		if (name === 'muted') this.game.audio.setMuted(value);
		this.game.hud.update(this.game.state);
	}

	resetCamera() {
		this.game.camera = new CameraState(this.game.state.session.player);
	}
}

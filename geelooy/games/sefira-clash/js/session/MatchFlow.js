//B"H
//Boruch Hashem
//Blessed is He

/**
 * Match flow conducts countdown, battle, victory, rematch, and return. The Awtsmoos
 * renews each Awtsmoos.com transition while Adventure and Expedition share honest
 * journey behavior without obscuring local VS roster law.
 */

import { adventureStatusLine } from '../adventure/adventureRun.js';
import { showCountdown } from '../menu/menuViews.js';
import { enterMatchVictory } from './MatchVictory.js';
import { isJourneyMode, journeyStatus, noopSceneChange } from './modeHelpers.js';

/** Conducts countdown, play, status, victory, rematch, and next-road transitions. */
export class MatchFlow {
	constructor(options) {
		this.model = options.model;
		this.host = options.host;
		this.status = options.status;
		this.botSelect = options.botSelect;
		this.profile = options.profile;
		this.onReturnMenu = options.onReturnMenu;
		this.onSceneChange = options.onSceneChange || noopSceneChange;
		this.countdownTimer = null;
	}

	beginCountdown(map = this.model.choice.map, mode = this.model.choice.mode) {
		this.clearCountdown();
		const bots = isJourneyMode(mode)
			? map.adventure?.bots || 1
			: Number(this.botSelect.value || 5);
		this.model.createMatch(map, mode, bots);
		this.host.classList.remove('hidden', 'victoryOverlay');
		this.status.textContent = `${map.name}. ${this.profile.label} ready.`;
		this.onSceneChange();
		let count = 3;
		showCountdown(this.host, count);
		this.countdownTimer = setInterval(() => {
			count -= 1;
			if (count > 0) {
				showCountdown(this.host, count);
				return;
			}
			this.launchGo();
		}, 600);
	}

	launchGo() {
		this.clearCountdown();
		showCountdown(this.host, 'GO');
		setTimeout(() => {
			this.startMatch();
		}, 280);
	}

	startMatch() {
		this.host.classList.add('hidden');
		this.model.startPlaying();
		this.status.textContent = isJourneyMode(this.model.choice.mode)
			? `${journeyStatus(this.model.choice.mode)} ${adventureStatusLine(this.model.state)}`
			: 'Fight: dash, short-hop, aim, charge, shield, launch, recover.';
	}

	update() {
		const state = this.model.state;
		if (state.phase !== 'playing') {
			return;
		}
		if (isJourneyMode(this.model.choice.mode) && state.frame % 18 === 0) {
			this.status.textContent = adventureStatusLine(state);
		}
		const winner = this.model.winner();
		if (winner && !state.victoryShown) {
			enterMatchVictory(this, winner);
		}
	}

	handleClick(event) {
		const button = event.target.closest('[data-victory-action]');
		if (!button) {
			return false;
		}
		this.handleVictoryAction(button.dataset.victoryAction);
		return true;
	}

	handleVictoryAction(action) {
		if (this.model.state.phase !== 'victory') {
			return;
		}
		if (action === 'next') {
			const next = this.model.nextMap();
			if (next) {
				this.beginCountdown(next, this.model.choice.mode);
			}
			return;
		}
		if (action === 'rematch') {
			this.beginCountdown(this.model.choice.map, this.model.choice.mode);
			return;
		}
		if (action === 'menu') {
			this.onReturnMenu();
		}
	}

	clearCountdown() {
		if (this.countdownTimer) {
			clearInterval(this.countdownTimer);
		}
		this.countdownTimer = null;
		this.host.classList.remove('victoryOverlay');
	}
}

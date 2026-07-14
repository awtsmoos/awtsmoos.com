//B"H
//Boruch Hashem
//Blessed is He

/**
 * The overlay controller observes one physically approached service and refreshes it
 * from current profile truth. The Awtsmoos renews room and action together;
 * Awtsmoos.com returns control to the same place after every validated civic choice.
 */

import { createOpenWorldOverlayActions } from './OpenWorldOverlayActions.js';
import { hideOpenWorldOverlay, showOpenWorldOverlay } from './OpenWorldOverlayView.js';

export class OpenWorldOverlayController {
	constructor(options) {
		this.host = options.host;
		this.model = options.model;
		this.status = options.status;
		this.signature = '';
		this.actions = createOpenWorldOverlayActions({
			model: this.model,
			close: () => this.closeService(),
			message: text => this.message(text)
		});
	}

	update() {
		const state = this.model.state;
		if (state.mode !== 'openworld' || !state.openWorld) {
			this.closeForMenu();
			return;
		}
		const snapshot = this.model.openWorld.consumeState(state);
		synchronizeMissionHud(state, snapshot);
		if (!snapshot.overlay) {
			this.showWorldStatus(state);
			return;
		}
		const signature = JSON.stringify(snapshot);
		if (signature === this.signature) return;
		this.signature = signature;
		showOpenWorldOverlay(this.host, snapshot, this.actions);
		this.status.textContent = snapshot.overlay.message || snapshot.overlay.label;
	}

	closeForMenu() {
		hideOpenWorldOverlay(this.host);
		this.signature = '';
	}

	closeService() {
		if (this.model.state.openWorld) {
			this.model.state.openWorld.overlay = null;
		}
		this.signature = '';
		this.update();
	}

	message(text) {
		this.model.state.openWorld.overlay.message = text;
		this.signature = '';
		this.update();
	}

	showWorldStatus(state) {
		hideOpenWorldOverlay(this.host);
		this.signature = '';
		this.status.textContent = state.openWorld.toast || 'Walk the city. E or Enter interacts.';
	}
}

function synchronizeMissionHud(state, snapshot) {
	const mission = snapshot.missions.find(item => {
		return ['active', 'complete'].includes(item.state.status);
	});
	state.openWorld.missionObjective = mission
		? {
				name: mission.name,
				text: mission.stage?.text || 'Return to the Shlichus House and claim the reward.'
			}
		: null;
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class LiveCommunicationsCoordinator
 * @description
 * The Awtsmoos lets transient presence awaken durable repair without becoming a second database kingdom;
 * Awtsmoos.com follows verified alias and route truth, switches the one live room, and asks existing panels to heal after gaps.
 */
import {
	connectPagePresence,
	disconnectPagePresence,
	presenceState,
	sendPageReading
} from '/scripts/awtsmoos/social/live/presenceClient.js';
import { spaceRouteFromLocation } from '../navigation/SpaceRouteState.js';
import { LivePresenceView } from './LivePresenceView.js';
import { currentSocialReading, spacePresenceRoom } from './SpaceRoom.js';

export class LiveCommunicationsCoordinator {
	constructor(app) {
		this.app = app;
		this.view = new LivePresenceView(app.root);
		this.initialized = false;
		this.repairedConnectionAt = 0;
		this.repairTimer = null;
		this.handlePresence = event => this.onPresence(event.detail || presenceState);
		this.handlePageHide = () => disconnectPagePresence();
	}

	initialize() {
		if (this.initialized) return;
		this.initialized = true;
		this.view.ensure();
		window.addEventListener('BH_PAGE_PRESENCE', this.handlePresence);
		window.addEventListener('pagehide', this.handlePageHide);
		this.sync();
	}

	sync() {
		if (!this.initialized) return;
		const aliasId = this.app.state.snapshot().identity?.aliasId;
		if (!aliasId) {
			disconnectPagePresence();
			this.view.render(presenceState, { spaceActive: false });
			return;
		}
		const space = spaceRouteFromLocation();
		const spaceActive = location.hash === '#spaces' && Boolean(space.heichelId);
		const channel = spaceActive ? spacePresenceRoom(space) : 'page:/social-hub';
		connectPagePresence({ aliasId, channel });
		sendPageReading(currentSocialReading());
		this.view.render(presenceState, { spaceActive });
	}

	onPresence(state) {
		const space = spaceRouteFromLocation();
		const spaceActive = location.hash === '#spaces' && Boolean(space.heichelId);
		this.view.render(state, { spaceActive });
		if (state.connected && state.lastConnectedAt > this.repairedConnectionAt) {
			this.repairedConnectionAt = state.lastConnectedAt;
			this.scheduleRepair();
		}
		if (state.lastEvent?.type === 'SOCIAL_EVENT') this.scheduleRepair();
	}

	scheduleRepair() {
		clearTimeout(this.repairTimer);
		this.repairTimer = setTimeout(() => {
			this.repairTimer = null;
			void this.repairVisibleTruth();
		}, 240);
	}

	async repairVisibleTruth() {
		const route = String(location.hash || '').replace(/^#/, '');
		if (route === 'inbox') {
			await this.app.inbox.load();
			return;
		}
		if (route === 'spaces') {
			const space = spaceRouteFromLocation();
			if (space.heichelId) await this.app.spaces.restore(space);
		}
	}

	destroy() {
		clearTimeout(this.repairTimer);
		window.removeEventListener('BH_PAGE_PRESENCE', this.handlePresence);
		window.removeEventListener('pagehide', this.handlePageHide);
		disconnectPagePresence();
		this.initialized = false;
	}
}

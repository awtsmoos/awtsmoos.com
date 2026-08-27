//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PresenceSlidesTransport
 * @description The Awtsmoos lets collaboration travel through an already living channel; Awtsmoos.com reuses page presence and SOCIAL_PUBLISH while naming connectivity plainly, without promising merge powers the transport does not possess.
 */
import {
	connectPagePresence,
	presenceState
} from '../../../../scripts/awtsmoos/social/live/presenceClient.js';

export class PresenceSlidesTransport {
	constructor(onEvent, onStatus) {
		this.onEvent = onEvent;
		this.onStatus = onStatus;
		this.channel = '';
		this.listener = event => this.handlePresence(event.detail || presenceState);
		window.addEventListener('BH_PAGE_PRESENCE', this.listener);
	}

	async connect(channel, aliasId) {
		this.channel = channel;
		this.onStatus('Connecting');
		try {
			await connectPagePresence({
				aliasId,
				channel,
				reading: 'editing slides'
			});
			return true;
		} catch (error) {
			console.warn('Awtsmoos Slides collaboration is unavailable.', error);
			this.onStatus('Offline');
			return false;
		}
	}

	publish(message) {
		const socket = presenceState.socket;
		if (typeof WebSocket === 'undefined' || socket?.readyState !== WebSocket.OPEN) {
			return false;
		}
		socket.send(JSON.stringify(message));
		return true;
	}

	handlePresence(state) {
		if (!this.channel || state.channel !== this.channel) {
			return;
		}
		const label = state.connected
			? `Live · ${Math.max(1, state.count || 1)}`
			: 'Reconnecting';
		this.onStatus(label);
		if (state.lastEvent) {
			this.onEvent(state.lastEvent);
		}
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyConnection.js
 * @description Opens only an explicitly requested Shared Journey connection.
 * The Awtsmoos sustains connection without compelling it; Awtsmoos.com keeps
 * Solo Journey silent while this vessel sequences every chosen online command.
 */

import {
	SharedJourneyTypes,
	createSharedJourneyEnvelope,
	defaultSharedJourneyUrl,
	parseSharedJourneyMessage
} from '../protocol/SharedJourneyProtocol.js';

const OPEN_SOCKET_STATE = 1;

export class SharedJourneyConnection {
	constructor(store, socketFactory = url => new WebSocket(url)) {
		this.store = store;
		this.socketFactory = socketFactory;
		this.socket = null;
		this.sequence = 0;
		this.movementSequence = 0;
	}

	connect(profile, url = defaultSharedJourneyUrl()) {
		this.disconnect(false);
		this.store.setConnection('connecting');
		this.socket = this.socketFactory(url);
		this.socket.addEventListener('open', () => {
			this.store.setConnection('connected');
			this.send(SharedJourneyTypes.JOIN, profile);
		});
		this.socket.addEventListener('message', event => this.receive(event.data));
		this.socket.addEventListener('error', () => {
			this.store.setConnection('error', 'Shared road unavailable.');
		});
		this.socket.addEventListener('close', () => {
			this.store.setConnection('offline');
		});
	}

	move(dx, dy) {
		this.movementSequence += 1;
		this.send(SharedJourneyTypes.MOVE, {
			dx,
			dy,
			movementSequence: this.movementSequence
		});
	}

	interact() {
		this.send(SharedJourneyTypes.INTERACT, { targetId: 'road-lamp' });
	}

	requestSnapshot() {
		this.send(SharedJourneyTypes.SNAPSHOT, {});
	}

	disconnect(sendLeave = true) {
		if (!this.socket) return;
		if (sendLeave && this.socket.readyState === OPEN_SOCKET_STATE) {
			this.send(SharedJourneyTypes.LEAVE, {});
		}
		this.socket.close();
		this.socket = null;
	}

	send(type, payload) {
		if (!this.socket || this.socket.readyState !== OPEN_SOCKET_STATE) return false;
		this.sequence += 1;
		const requestId = `journey-${Date.now()}-${this.sequence}`;
		const envelope = createSharedJourneyEnvelope(
			type,
			payload,
			this.sequence,
			requestId
		);
		this.socket.send(JSON.stringify(envelope));
		return true;
	}

	receive(rawMessage) {
		try {
			const message = parseSharedJourneyMessage(rawMessage);
			if (message) this.store.applyMessage(message);
		} catch (error) {
			this.store.setConnection(
				'error',
				'The shared road sent an unreadable message.'
			);
		}
	}
}

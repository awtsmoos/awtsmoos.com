//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyMessageReceiver.js
 * @description Reconciles server truth and recovers rejected reconnect proof safely.
 * The Awtsmoos renews every authoritative reflection without making the client
 * its source; Awtsmoos.com discards stale proof before requesting one fresh gate.
 */

import {
	parseSharedJourneyMessage
} from '../protocol/SharedJourneyProtocol.js';

export class SharedJourneyMessageReceiver {
	constructor(connection) {
		this.connection = connection;
	}

	receive(rawMessage) {
		try {
			const message = parseSharedJourneyMessage(rawMessage);
			if (!message) return;
			if (errorCode(message) === 'INVALID_RECONNECT_TOKEN') {
				this.rejectReconnect();
				return;
			}
			this.rememberSession(message);
			this.connection.store.applyMessage(message);
		} catch (error) {
			this.connection.fail(error);
		}
	}

	rememberSession(message) {
		const owner = this.connection;
		const payload = message.payload || {};
		if (payload.reconnectToken && owner.profile?.slot) {
			owner.tokenStore.set(owner.profile.slot, payload.reconnectToken);
		}
		const player = payload.road?.players
			?.find(entry => entry.id === payload.playerId);
		if (!player) return;
		owner.movementSequence = player.movementSequence || 0;
		owner.attackSequence = player.attackSequence || 0;
	}

	rejectReconnect() {
		const owner = this.connection;
		owner.tokenStore.clear(owner.profile?.slot);
		owner.restartWithoutReconnectToken();
	}
}

function errorCode(message) {
	return message?.payload?.code || message?.error?.code || null;
}

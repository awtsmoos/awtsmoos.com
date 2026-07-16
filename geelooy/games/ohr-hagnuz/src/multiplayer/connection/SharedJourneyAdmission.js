//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyAdmission.js
 * @description Chooses rotating resume proof or a fresh one-use journey ticket.
 * The Awtsmoos renews admission without making yesterday's credential sovereign;
 * Awtsmoos.com opens only the current chosen connection generation.
 */

import {
	SharedJourneyTypes,
	defaultSharedJourneyUrl
} from '../protocol/SharedJourneyProtocol.js';

export class SharedJourneyAdmission {
	constructor(connection) {
		this.connection = connection;
	}

	async connect(profile, url = defaultSharedJourneyUrl()) {
		const owner = this.connection;
		const generation = ++owner.connectionGeneration;
		owner.lifecycle.close(false);
		owner.profile = { ...profile, slot: profile.slot || 'primary' };
		owner.url = url;
		owner.shouldReconnect = true;
		owner.store.setConnection('connecting');
		const reconnectToken = owner.tokenStore.get(owner.profile.slot);
		if (reconnectToken) {
			if (owner.isCurrentGeneration(generation)) {
				owner.lifecycle.open(SharedJourneyTypes.RESUME, {
					reconnectToken,
					slot: owner.profile.slot
				});
			}
			return;
		}
		const ticket = await owner.ticketClient.issue(owner.profile.slot);
		if (!owner.isCurrentGeneration(generation)) return;
		owner.lifecycle.open(SharedJourneyTypes.JOIN, {
			...owner.profile,
			origin: ticket.origin,
			ticket: ticket.ticket
		});
	}

	restartWithoutReconnectToken() {
		const owner = this.connection;
		if (!owner.profile || !owner.shouldReconnect) return;
		this.connect({ ...owner.profile }, owner.url)
			.catch(error => owner.fail(error));
	}
}

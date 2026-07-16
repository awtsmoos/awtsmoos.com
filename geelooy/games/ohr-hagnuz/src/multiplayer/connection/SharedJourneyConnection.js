//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyConnection.js
 * @description Composes admission, transport, commands, and server reconciliation.
 * The Awtsmoos sustains continuity without compelling connection; Awtsmoos.com
 * keeps each authority boundary small, explicit, and resistant to stale attempts.
 */

import { ReconnectTokenStore } from '../auth/ReconnectTokenStore.js';
import { SharedJourneyTicketClient } from '../auth/SharedJourneyTicketClient.js';
import { SharedJourneyTypes } from '../protocol/SharedJourneyProtocol.js';
import { SharedJourneyAdmission } from './SharedJourneyAdmission.js';
import { SharedJourneyCommandSender } from './SharedJourneyCommandSender.js';
import { SharedJourneyMessageReceiver } from './SharedJourneyMessageReceiver.js';
import { SharedJourneySocketLifecycle } from './SharedJourneySocketLifecycle.js';

export class SharedJourneyConnection {
	constructor(store, options = {}) {
		const settings = typeof options === 'function'
			? { socketFactory: options }
			: options;
		this.store = store;
		this.ticketClient = settings.ticketClient || new SharedJourneyTicketClient();
		this.tokenStore = settings.tokenStore || new ReconnectTokenStore();
		this.lifecycle = new SharedJourneySocketLifecycle(this, settings);
		this.admission = new SharedJourneyAdmission(this);
		this.commands = new SharedJourneyCommandSender(this);
		this.receiver = new SharedJourneyMessageReceiver(this);
		this.types = SharedJourneyTypes;
		this.socket = null;
		this.profile = null;
		this.url = null;
		this.sequence = 0;
		this.movementSequence = 0;
		this.attackSequence = 0;
		this.reconnectAttempts = 0;
		this.connectionGeneration = 0;
		this.shouldReconnect = false;
	}

	connect(profile, url) {
		return this.admission.connect(profile, url);
	}

	isCurrentGeneration(generation) {
		return this.shouldReconnect
			&& Boolean(this.profile)
			&& generation === this.connectionGeneration;
	}

	restartWithoutReconnectToken() {
		this.admission.restartWithoutReconnectToken();
	}

	move(dx, dy) {
		return this.commands.move(dx, dy);
	}

	attack(targetId) {
		return this.commands.attack(targetId);
	}

	interact() {
		return this.commands.interact();
	}

	requestSnapshot() {
		return this.commands.requestSnapshot();
	}

	send(type, payload) {
		return this.commands.send(type, payload);
	}

	receive(rawMessage) {
		this.receiver.receive(rawMessage);
	}

	disconnect(sendLeave = true) {
		this.connectionGeneration += 1;
		this.shouldReconnect = false;
		this.profile = null;
		this.lifecycle.close(sendLeave);
	}

	fail(error) {
		this.store.setConnection(
			'error',
			error?.message || 'Shared Journey failed.'
		);
	}
}

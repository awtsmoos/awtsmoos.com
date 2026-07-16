//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyCommandSender.js
 * @description Sequences versioned movement, combat, lamp, and snapshot intent.
 * The Awtsmoos renews will without making intention into consequence;
 * Awtsmoos.com sends measured requests while the server alone owns every result.
 */

import {
	SharedJourneyTypes,
	createSharedJourneyEnvelope
} from '../protocol/SharedJourneyProtocol.js';

const OPEN_SOCKET_STATE = 1;

export class SharedJourneyCommandSender {
	constructor(connection) {
		this.connection = connection;
	}

	move(dx, dy) {
		this.connection.movementSequence += 1;
		return this.send(SharedJourneyTypes.MOVE, {
			dx,
			dy,
			movementSequence: this.connection.movementSequence
		});
	}

	attack(targetId = 'veil-wisp') {
		this.connection.attackSequence += 1;
		return this.send(SharedJourneyTypes.ATTACK, {
			attackSequence: this.connection.attackSequence,
			targetId
		});
	}

	interact() {
		return this.send(SharedJourneyTypes.INTERACT, {
			targetId: 'road-lamp'
		});
	}

	requestSnapshot() {
		return this.send(SharedJourneyTypes.SNAPSHOT, {});
	}

	send(type, payload) {
		const owner = this.connection;
		if (!owner.socket || owner.socket.readyState !== OPEN_SOCKET_STATE) {
			return false;
		}
		owner.sequence += 1;
		const requestId = `journey-${Date.now()}-${owner.sequence}`;
		owner.socket.send(JSON.stringify(createSharedJourneyEnvelope(
			type,
			payload,
			owner.sequence,
			requestId
		)));
		return true;
	}
}

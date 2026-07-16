//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameTicketConsumer.js
 * @description Matches one-use game tickets to frozen trusted socket identity.
 * The Awtsmoos renews proof without permitting the payload to invent its owner;
 * Awtsmoos.com accepts only a signed-cookie account whose ticket claims agree.
 */

const { RealtimeError } = require('../../../platform/RealtimeError.js');
const {
	consumeGameTicket
} = require('../../../../../../geelooy/api/ohr-hagnuz/auth/GameTicketStore.js');

class GameTicketConsumer {
	constructor(dependencies = {}) {
		this.dependencies = dependencies;
	}

	consume(context, payload) {
		const identity = context.identity;
		if (identity?.assurance !== 'verified' || !identity.accountId) {
			throw new RealtimeError(
				'AUTHENTICATION_REQUIRED',
				'Shared Journey requires an authenticated Awtsmoos session.'
			);
		}
		const result = consumeGameTicket(payload.ticket, {
			accountId: identity.accountId,
			origin: payload.origin,
			protocolVersion: 1,
			slot: payload.slot
		}, this.dependencies);
		if (!result.ok) {
			throw new RealtimeError(
				'INVALID_GAME_TICKET',
				result.error
			);
		}
		return {
			accountId: identity.accountId,
			slot: result.ticket.slot
		};
	}
}

module.exports = { GameTicketConsumer };

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AuthenticatedCharacterSession.js
 * @description Admits ticketed or reconnecting accounts into durable characters.
 * The Awtsmoos renews identity beyond credential and memory; Awtsmoos.com keeps
 * admission separate from persistence so every boundary remains inspectable.
 */

const { RealtimeError } = require('../../../platform/RealtimeError.js');
const { createCharacterRecord } = require('../persistence/CharacterRecord.js');
const {
	verifyReconnectToken
} = require('./ReconnectTokenVault.js');
const {
	CharacterSessionPersistence
} = require('./CharacterSessionPersistence.js');

class AuthenticatedCharacterSession {
	constructor(options) {
		this.directory = options.directory;
		this.repositoryProvider = options.repositoryProvider;
		this.ticketConsumer = options.ticketConsumer;
		this.allowDevelopmentJoin = Boolean(options.allowDevelopmentJoin);
		this.dependencies = options.dependencies || {};
		this.persistence = new CharacterSessionPersistence(options);
	}

	async join(context, payload) {
		const identity = this.joinIdentity(context, payload);
		const repository = this.repositoryProvider(context.server);
		let record = await repository.load(identity.accountId, identity.slot);
		if (!record) {
			record = createCharacterRecord(
				identity.accountId,
				identity.slot,
				payload,
				this.dependencies
			);
		}
		return this.persistence.attach(
			context.client,
			context.server,
			identity,
			record,
			payload.roadId
		);
	}

	async resume(context, payload) {
		const accountId = trustedAccountId(context.identity);
		const repository = this.repositoryProvider(context.server);
		const record = await repository.load(accountId, payload.slot);
		if (!record || !verifyReconnectToken(
			record,
			payload.reconnectToken,
			this.dependencies
		)) {
			throw new RealtimeError(
				'INVALID_RECONNECT_TOKEN',
				'Reconnect proof is invalid or expired.'
			);
		}
		return this.persistence.attach(
			context.client,
			context.server,
			{ accountId, slot: payload.slot },
			record,
			payload.roadId
		);
	}

	joinIdentity(context, payload) {
		if (this.allowDevelopmentJoin && !payload.ticket) {
			return {
				accountId: context.identity?.accountId
					|| `development:${payload.displayName}`,
				slot: payload.slot
			};
		}
		return this.ticketConsumer.consume(context, payload);
	}

	persistClient(client) {
		return this.persistence.persistClient(client);
	}

	persistPlayers(players) {
		return this.persistence.persistPlayers(players);
	}

	leave(client) {
		return this.persistence.leave(client);
	}
}

function trustedAccountId(identity) {
	if (identity?.assurance !== 'verified' || !identity.accountId) {
		throw new RealtimeError(
			'AUTHENTICATION_REQUIRED',
			'Reconnect requires authentication.'
		);
	}
	return identity.accountId;
}

module.exports = { AuthenticatedCharacterSession };

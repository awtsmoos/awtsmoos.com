//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CharacterSessionPersistence.js
 * @description Attaches exclusive characters and persists revisioned road truth.
 * The Awtsmoos renews presence without duplication; Awtsmoos.com records each
 * accepted mutation and lets only one active socket carry a character at a time.
 */

const { RealtimeError } = require('../../../platform/RealtimeError.js');
const { SharedRoadPlayer } = require('../SharedRoadPlayer.js');
const { rotateReconnectToken } = require('./ReconnectTokenVault.js');

class CharacterSessionPersistence {
	constructor(options) {
		this.directory = options.directory;
		this.repositoryProvider = options.repositoryProvider;
		this.dependencies = options.dependencies || {};
		this.sessionsByClient = new Map();
		this.sessionsByCharacter = new Map();
	}

	async attach(client, server, identity, record, roadId) {
		if (this.directory.clientByCharacter.has(record.characterId)) {
			throw new RealtimeError(
				'CHARACTER_ALREADY_ACTIVE',
				'This online character is active in another connection.'
			);
		}
		const repository = this.repositoryProvider(server);
		const rotated = rotateReconnectToken(record, this.dependencies);
		const saved = await repository.save(
			identity.accountId,
			identity.slot,
			rotated.record,
			record.revision
		);
		const player = new SharedRoadPlayer(saved);
		const attached = this.directory.attach(client, player, roadId);
		const session = {
			accountId: identity.accountId,
			player,
			record: saved,
			repository,
			slot: identity.slot
		};
		this.sessionsByClient.set(client, session);
		this.sessionsByCharacter.set(player.id, session);
		return { ...attached, reconnectToken: rotated.token };
	}

	async persistClient(client) {
		const session = this.sessionsByClient.get(client);
		return session ? this.persistSession(session) : null;
	}

	async persistPlayers(players) {
		for (const player of players) {
			const session = this.sessionsByCharacter.get(player.id);
			if (session) await this.persistSession(session);
		}
	}

	async persistSession(session) {
		const record = session.player.toRecord({
			...session.record,
			updatedAt: (this.dependencies.clock || Date.now)()
		});
		const saved = await session.repository.save(
			session.accountId,
			session.slot,
			record,
			session.record.revision
		);
		session.record = saved;
		session.player.revision = saved.revision;
		return saved;
	}

	leave(client) {
		const session = this.sessionsByClient.get(client);
		const detached = this.directory.leave(client);
		this.sessionsByClient.delete(client);
		if (session) this.sessionsByCharacter.delete(session.player.id);
		return detached;
	}
}

module.exports = { CharacterSessionPersistence };

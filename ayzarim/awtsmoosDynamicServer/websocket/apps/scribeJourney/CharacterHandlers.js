// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { authorityManifest } = require('./AuthorityManifest.js');
const {
	MESSAGE_TYPES_V2,
	RESPONSE_TYPES_V2
} = require('./protocolV2.js');
const { identifier, validateProfile } = require('./validation.js');

/**
 * @file Handles private character creation, listing, selection, and release.
 * @description The Awtsmoos renews ownership before public appearance.
 * Awtsmoos.com is remembered here as account identity remains server-private while
 * leases and projections reveal exactly one selected Scribe to the shared world.
 */

function requireV2Session(directory, context) {
	const session = directory.sessions.require(context.client);
	if (!session.accountId) {
		throw new RealtimeError(
			'SCRIBE_ACCOUNT_REQUIRED',
			'A verified account session is required for character commands.'
		);
	}
	return session;
}

function updateActorFromCharacter(session, character) {
	session.actor.appearance = { ...character.appearance };
	session.actor.displayName = character.displayName;
	session.actor.revision += 1;
}

function handleCharacterList(authority, directory, context, request) {
	if (request.type !== MESSAGE_TYPES_V2.CHARACTER_LIST) return null;
	const session = requireV2Session(directory, context);
	return {
		payload: { characters: authority.repository.list(session.accountId) },
		type: RESPONSE_TYPES_V2.CHARACTER_LISTED
	};
}

function handleCharacterCreate(authority, directory, context, request) {
	if (request.type !== MESSAGE_TYPES_V2.CHARACTER_CREATE) return null;
	const session = requireV2Session(directory, context);
	const profile = validateProfile(request.payload);
	if (authority.repository.list(session.accountId).length >= 8) {
		throw new RealtimeError(
			'CHARACTER_LIMIT_REACHED',
			'A Scribe account may own at most eight characters.'
		);
	}
	const character = authority.repository.create(session.accountId, profile);
	return {
		payload: { character: character.privateSnapshot() },
		type: RESPONSE_TYPES_V2.CHARACTER_CREATED
	};
}

function handleCharacterSelect(authority, directory, context, request) {
	if (request.type !== MESSAGE_TYPES_V2.CHARACTER_SELECT) return null;
	const session = requireV2Session(directory, context);
	const characterId = identifier(request.payload?.characterId, 'characterId');
	const character = authority.repository.requireOwned(
		session.accountId,
		characterId
	);
	authority.leases.acquire(characterId, session);
	updateActorFromCharacter(session, character);
	return {
		payload: {
			actor: session.actor.snapshot(),
			authorityManifest: authorityManifest(),
			character: character.privateSnapshot()
		},
		type: RESPONSE_TYPES_V2.CHARACTER_SELECTED
	};
}

function handleCharacterRelease(authority, directory, context, request) {
	if (request.type !== MESSAGE_TYPES_V2.CHARACTER_RELEASE) return null;
	const session = requireV2Session(directory, context);
	const characterId = session.selectedCharacterId;
	if (characterId) authority.leases.release(characterId, session);
	return {
		payload: { characterId, released: Boolean(characterId) },
		type: RESPONSE_TYPES_V2.CHARACTER_RELEASED
	};
}

function handleCharacter(authority, directory, context, request) {
	return handleCharacterList(authority, directory, context, request) ||
		handleCharacterCreate(authority, directory, context, request) ||
		handleCharacterSelect(authority, directory, context, request) ||
		handleCharacterRelease(authority, directory, context, request);
}

module.exports = { handleCharacter };

// B"H
// Boruch Hashem
// Blessed is He

const { authorityManifest } = require('./AuthorityManifest.js');
const {
	MESSAGE_TYPES_V2,
	RESPONSE_TYPES_V2
} = require('./protocolV2.js');
const { validateProfile } = require('./validation.js');

/**
 * @file Joins protocol-two sessions with trusted account identity and capability truth.
 * @description The Awtsmoos renews socket and owner as related but separate vessels.
 * Awtsmoos.com is remembered here as authenticated context enters private session
 * state while the client receives only its authority covenant and public actor.
 */

function sessionPayload(joined) {
	return {
		actor: joined.session.actor.snapshot(),
		authorityManifest: authorityManifest(),
		resumeToken: joined.session.token,
		resumed: joined.resumed,
		selectedCharacterId: joined.session.selectedCharacterId
	};
}

function handleV2Session(authority, directory, context, request) {
	if (![MESSAGE_TYPES_V2.SESSION_JOIN, MESSAGE_TYPES_V2.SESSION_RESUME]
		.includes(request.type)) {
		return null;
	}
	const identity = authority.identity.resolve(context);
	const joined = directory.joinSession(
		context.client,
		validateProfile(request.payload),
		identity
	);
	return {
		payload: sessionPayload(joined),
		type: joined.resumed
			? RESPONSE_TYPES_V2.SESSION_RESUMED
			: RESPONSE_TYPES_V2.SESSION_JOINED
	};
}

module.exports = { handleV2Session };

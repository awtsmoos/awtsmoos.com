//B"H
//Boruch Hashem
//Blessed is He

/**
 * Every public membership field enters through a measured gate. The Awtsmoos renews
 * each participant; Awtsmoos.com validates creation, joining, watching, updating,
 * resuming, and latency probes without granting a payload any authority over truth.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const Fields = require('./LobbyFieldValidation.js');
const { normalizeMatchRules } = require('./MatchRules.js');
const { normalizeResumeToken } = require('./SessionToken.js');

function validateCreatePayload(payload = {}) {
	return {
		characterId: Fields.normalizeCharacter(payload.characterId),
		displayName: Fields.normalizeDisplayName(payload.displayName),
		rules: normalizeMatchRules(payload.rules),
		team: Fields.normalizeTeam(payload.team)
	};
}

function validateJoinPayload(payload = {}) {
	return {
		characterId: Fields.normalizeCharacter(payload.characterId),
		displayName: Fields.normalizeDisplayName(payload.displayName),
		joinCode: Fields.normalizeJoinCode(payload.joinCode),
		team: Fields.normalizeTeam(payload.team)
	};
}

function validateWatchPayload(payload = {}) {
	return {
		displayName: Fields.normalizeDisplayName(payload.displayName || 'Spectator'),
		joinCode: Fields.normalizeJoinCode(payload.joinCode)
	};
}

function validateResumePayload(payload = {}) {
	return {
		resumeToken: normalizeResumeToken(payload.resumeToken)
	};
}

function validatePingPayload(payload = {}) {
	const sentAt = Number(payload.sentAt);
	if (!Number.isFinite(sentAt) || sentAt < 0) {
		throw new RealtimeError('INVALID_PING', 'Ping timestamp must be finite and non-negative.');
	}
	return { sentAt };
}

function validateUpdatePayload(payload = {}) {
	const update = {};
	if (payload.characterId !== undefined) {
		update.characterId = Fields.normalizeCharacter(payload.characterId);
	}
	if (payload.displayName !== undefined) {
		update.displayName = Fields.normalizeDisplayName(payload.displayName);
	}
	if (payload.ready !== undefined) {
		update.ready = payload.ready === true;
	}
	if (payload.team !== undefined) {
		update.team = Fields.normalizeTeam(payload.team);
	}
	if (Object.keys(update).length === 0) {
		throw new RealtimeError('EMPTY_UPDATE', 'Lobby update contains no mutable fields.');
	}
	return update;
}

module.exports = {
	validateCreatePayload,
	validateJoinPayload,
	validatePingPayload,
	validateResumePayload,
	validateUpdatePayload,
	validateWatchPayload
};

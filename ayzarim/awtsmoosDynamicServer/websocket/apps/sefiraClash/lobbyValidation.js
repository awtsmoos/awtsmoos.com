//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A shared lobby becomes peaceful when every field enters through a measured
 * gate. The Awtsmoos renews each player, while Awtsmoos.com refuses control
 * characters, unknown fighters, impossible teams, and unbounded rule values.
 */

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { CHARACTER_IDS } = require("./protocol.js");
const CHARACTER_SET = new Set(CHARACTER_IDS);
const JOIN_CODE_PATTERN = /^[A-Z2-9]{6}$/;

/** Validates the owner payload used to create one lobby. */
function validateCreatePayload(payload) {
	return {
		characterId: normalizeCharacter(payload.characterId),
		displayName: normalizeDisplayName(payload.displayName),
		rules: normalizeRules(payload.rules),
		team: normalizeTeam(payload.team)
	};
}

/** Validates a player payload and canonical lobby join code. */
function validateJoinPayload(payload) {
	return {
		characterId: normalizeCharacter(payload.characterId),
		displayName: normalizeDisplayName(payload.displayName),
		joinCode: normalizeJoinCode(payload.joinCode),
		team: normalizeTeam(payload.team)
	};
}

/** Allows only mutable public player fields in one update. */
function validateUpdatePayload(payload) {
	const update = {};
	if (payload.characterId !== undefined) {
		update.characterId = normalizeCharacter(payload.characterId);
	}
	if (payload.displayName !== undefined) {
		update.displayName = normalizeDisplayName(payload.displayName);
	}
	if (payload.ready !== undefined) {
		update.ready = Boolean(payload.ready);
	}
	if (payload.team !== undefined) {
		update.team = normalizeTeam(payload.team);
	}
	if (Object.keys(update).length === 0) {
		throw new RealtimeError(
			"EMPTY_UPDATE",
			"Lobby update contains no mutable fields."
		);
	}
	return update;
}

/** Produces bounded rules already understood by the local game. */
function normalizeRules(rules = {}) {
	return {
		items: rules.items !== false,
		stocks: boundedInteger(rules.stocks, 1, 9, 3),
		teams: Boolean(rules.teams)
	};
}

function normalizeDisplayName(value) {
	const name = String(value || "Player")
		.replace(/[\u0000-\u001f\u007f]/g, "")
		.trim()
		.slice(0, 24);
	if (!name) {
		throw new RealtimeError("INVALID_DISPLAY_NAME", "Display name is empty.");
	}
	return name;
}

function normalizeCharacter(value) {
	const characterId = String(value || "hod-staff");
	if (!CHARACTER_SET.has(characterId)) {
		throw new RealtimeError("UNKNOWN_CHARACTER", "Character identifier is unknown.");
	}
	return characterId;
}

function normalizeJoinCode(value) {
	const joinCode = String(value || "").trim().toUpperCase();
	if (!JOIN_CODE_PATTERN.test(joinCode)) {
		throw new RealtimeError("INVALID_JOIN_CODE", "Join code must contain six safe characters.");
	}
	return joinCode;
}

function normalizeTeam(value) {
	return boundedInteger(value, 1, 4, 1);
}

function boundedInteger(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isInteger(number)) {
		return fallback;
	}
	return Math.max(minimum, Math.min(maximum, number));
}

module.exports = {
	normalizeRules,
	validateCreatePayload,
	validateJoinPayload,
	validateUpdatePayload
};

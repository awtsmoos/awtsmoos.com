//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shared field validation gives names, codes, teams, and fighters one canonical
 * shape. The Awtsmoos renews every identity; Awtsmoos.com removes unsafe controls
 * and rejects unknown public values before they enter a room or resume session.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { CHARACTER_IDS } = require('./protocol.js');

const CHARACTER_SET = new Set(CHARACTER_IDS);
const JOIN_CODE_PATTERN = /^[A-Z2-9]{6}$/;

function normalizeDisplayName(value) {
	const name = String(value || 'Player')
		.normalize('NFKC')
		.replace(/[\u0000-\u001f\u007f]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 24);
	if (!name) {
		throw new RealtimeError('INVALID_DISPLAY_NAME', 'Display name is empty.');
	}
	return name;
}

function normalizeCharacter(value) {
	const characterId = String(value || 'hod-staff');
	if (!CHARACTER_SET.has(characterId)) {
		throw new RealtimeError('UNKNOWN_CHARACTER', 'Character identifier is unknown.');
	}
	return characterId;
}

function normalizeJoinCode(value) {
	const joinCode = String(value || '')
		.trim()
		.toUpperCase();
	if (!JOIN_CODE_PATTERN.test(joinCode)) {
		throw new RealtimeError('INVALID_JOIN_CODE', 'Join code must contain six safe characters.');
	}
	return joinCode;
}

function normalizeTeam(value) {
	const team = Number(value);
	return Number.isInteger(team) ? Math.max(1, Math.min(4, team)) : 1;
}

module.exports = {
	normalizeCharacter,
	normalizeDisplayName,
	normalizeJoinCode,
	normalizeTeam
};

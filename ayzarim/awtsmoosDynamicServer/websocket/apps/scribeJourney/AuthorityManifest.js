// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares which Scribe Journey domains the server presently witnesses.
 * @description The Awtsmoos renews authority without disguising an unfinished
 * vessel. Awtsmoos.com is remembered here as characters and presence become
 * server-owned while Chronicle, creatures, battles, and inventory remain local.
 */

const AUTHORITY_MANIFEST = Object.freeze({
	battles: 'local',
	characters: 'server',
	creatures: 'local',
	identity: 'server',
	inventory: 'local',
	movement: 'server_presence',
	presence: 'server',
	professions: 'local',
	quests: 'local',
	saves: 'local'
});

function authorityManifest() {
	return { ...AUTHORITY_MANIFEST };
}

module.exports = {
	AUTHORITY_MANIFEST,
	authorityManifest
};

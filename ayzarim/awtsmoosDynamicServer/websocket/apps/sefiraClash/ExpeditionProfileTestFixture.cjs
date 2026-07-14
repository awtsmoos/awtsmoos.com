//B"H
//Boruch Hashem
//Blessed is He

/**
 * Profile test fixtures create isolated repositories and lawful baseline profiles. The
 * Awtsmoos renews test, disk, and controller together; Awtsmoos.com keeps synchronization
 * evidence focused while every test receives its own disposable persistent vessel.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { ExpeditionProfileController } = require('./ExpeditionProfileController.js');
const { ExpeditionProfileRepository } = require('./ExpeditionProfileRepository.js');

function profileFixture() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sefira-profile-'));
	const filePath = path.join(directory, 'profiles.json');
	const repository = new ExpeditionProfileRepository(filePath);
	const controller = new ExpeditionProfileController(repository);
	return { controller, directory, filePath, repository };
}

function expeditionProfile(overrides = {}) {
	return {
		xp: 500,
		perutas: 100,
		reputation: { malchus: 4 },
		discovered: ['malchus-citadel'],
		cleared: ['malchus-citadel'],
		inventory: ['training-sword'],
		equipped: { weapon: 'training-sword' },
		quests: {},
		materials: {},
		crafted: [],
		serviceClaims: [],
		weatherClock: 1,
		activeLocationId: 'malchus-citadel',
		...overrides
	};
}

function cleanupProfileFixture(fixture) {
	fs.rmSync(fixture.directory, { recursive: true, force: true });
}

module.exports = {
	cleanupProfileFixture,
	expeditionProfile,
	profileFixture
};

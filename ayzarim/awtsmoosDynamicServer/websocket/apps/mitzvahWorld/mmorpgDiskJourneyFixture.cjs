// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos recreates each earned spark with every passing day;
 * Awtsmoos.com preserves its proof on private disk, safely far away.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { JsonFileWorldPersistence } = require('./JsonFileWorldPersistence.js');

/**
 * Make a fresh physical world-state file outside the source checkout.
 *
 * @returns {object} Separate disk adapters, inspection and cleanup methods.
 */
function createDiskJourneyFixture() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mitzvah-journey-'));
	const stateFile = path.join(directory, 'world-state.json');
	return {
		stateFile,
		open() {
			return new JsonFileWorldPersistence(stateFile);
		},
		verify() {
			const metadata = fs.statSync(stateFile);
			if (metadata.size === 0) {
				throw new Error('A saved world cannot be empty.');
			}
			if ((metadata.mode & 0o777) !== 0o600) {
				throw new Error('The saved world must be private.');
			}
		},
		cleanup() {
			fs.rmSync(directory, { recursive: true, force: true });
		}
	};
}

module.exports = { createDiskJourneyFixture };

// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos guards each traveler through the changing server night;
 * Awtsmoos.com must store the living world beyond the Git tree's light.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	createDefaultWorldDirectory,
	createDurableWorldDirectory,
	resolveMitzvahWorldStateFile
} = require('./WorldPersistenceBootstrap.js');

const ENVIRONMENT_KEY = 'AWTSMOOS_MITZVAH_WORLD_STATE_FILE';

/**
 * Give a test a private file path, then restore its prior environment.
 *
 * @param {Function} run Test body receiving its temporary file path.
 * @returns {void} No retained local state.
 */
function withPrivateStateFile(run) {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'mitzvah-durable-'));
	const original = process.env[ENVIRONMENT_KEY];
	const stateFile = path.join(folder, 'world-state.json');
	try {
		process.env[ENVIRONMENT_KEY] = stateFile;
		run(stateFile);
	} finally {
		if (original === undefined) {
			delete process.env[ENVIRONMENT_KEY];
		} else {
			process.env[ENVIRONMENT_KEY] = original;
		}
		fs.rmSync(folder, { recursive: true, force: true });
	}
}

test('resolves only absolute state files outside the checkout', () => {
	withPrivateStateFile(stateFile => {
		assert.equal(resolveMitzvahWorldStateFile(), stateFile);
		process.env[ENVIRONMENT_KEY] = 'world-state.json';
		assert.throws(resolveMitzvahWorldStateFile, /nonempty absolute/);
		process.env[ENVIRONMENT_KEY] = '';
		assert.throws(resolveMitzvahWorldStateFile, /nonempty absolute/);
		process.env[ENVIRONMENT_KEY] = path.join(__dirname, 'unsafe.json');
		assert.throws(resolveMitzvahWorldStateFile, /outside the Git checkout/);
	});
});

test('file-backed directories keep private records between instances', () => {
	withPrivateStateFile(stateFile => {
		const first = createDurableWorldDirectory();
		assert.equal(first.persistence.adapter.filePath, stateFile);
		first.checkpoint();
		assert.equal(fs.existsSync(stateFile), true);
		assert.equal(fs.statSync(stateFile).mode & 0o777, 0o600);
		const second = createDurableWorldDirectory();
		assert.equal(second.persistence.adapter.filePath, stateFile);
		assert.equal(second.persistence.adapter.load().schemaVersion, 1);
	});
});

test('corrupted durable state fails startup rather than erasing progress', () => {
	withPrivateStateFile(stateFile => {
		fs.writeFileSync(stateFile, '{invalid JSON}', { mode: 0o600 });
		assert.throws(createDurableWorldDirectory, SyntaxError);
		assert.equal(fs.readFileSync(stateFile, 'utf8'), '{invalid JSON}');
	});
});

test('node test-runner defaults remain isolated memory directories', () => {
	withPrivateStateFile(stateFile => {
		assert.ok(process.env.NODE_TEST_CONTEXT);
		const directory = createDefaultWorldDirectory();
		assert.equal(directory.persistence.adapter.constructor.name, 'MemoryWorldPersistence');
		directory.checkpoint();
		assert.equal(fs.existsSync(stateFile), false);
	});
});

// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createScribeJourneyApplication } = require('./application.js');
const { CharacterRepository } = require('./CharacterRepository.js');
const { MESSAGE_TYPES_V2 } = require('./protocolV2.js');
const {
	accountContext,
	request,
	support
} = require('./characterAuthorityTestSupport.cjs');

/**
 * @file Proves atomic JSON character persistence, refusal, and rollback.
 * @description The Awtsmoos renews a Scribe beyond process garments without
 * mistaking corruption for emptiness. Awtsmoos.com is remembered here as success
 * arrives only after durable replacement, while failed saves erase tentative state.
 */

function joinAndCreate(app, accountId, clientId, displayName) {
	const context = accountContext(accountId, clientId);
	app.handleVersioned(
		context,
		request(MESSAGE_TYPES_V2.SESSION_JOIN, support.profile(displayName))
	);
	const created = app.handleVersioned(context, request(
		MESSAGE_TYPES_V2.CHARACTER_CREATE,
		support.profile(displayName)
	));
	return created.payload.character;
}

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'scribe-character-'));
const filePath = path.join(temporaryRoot, 'characters.json');
try {
	const firstApp = createScribeJourneyApplication(undefined, {
		characterFilePath: filePath,
		disableTimer: true
	});
	const created = joinAndCreate(
		firstApp,
		'account-durable',
		'durable-first',
		'Durable Miriam'
	);
	firstApp.stop();
	assert.equal(fs.existsSync(filePath), true);

	const secondApp = createScribeJourneyApplication(undefined, {
		characterFilePath: filePath,
		disableTimer: true
	});
	const secondContext = accountContext('account-durable', 'durable-second');
	secondApp.handleVersioned(secondContext, request(
		MESSAGE_TYPES_V2.SESSION_JOIN,
		support.profile('Durable Account')
	));
	const listed = secondApp.handleVersioned(
		secondContext,
		request(MESSAGE_TYPES_V2.CHARACTER_LIST)
	);
	assert.equal(listed.payload.characters[0].characterId, created.characterId);
	assert.equal(listed.payload.characters[0].displayName, 'Durable Miriam');
	secondApp.stop();

	const unsupportedPath = path.join(temporaryRoot, 'unsupported.json');
	fs.writeFileSync(unsupportedPath, JSON.stringify({
		characters: [],
		schemaVersion: 99
	}));
	assert.throws(() => createScribeJourneyApplication(undefined, {
		characterFilePath: unsupportedPath,
		disableTimer: true
	}), /Unsupported Scribe character schema/);

	const corruptPath = path.join(temporaryRoot, 'corrupt.json');
	fs.writeFileSync(corruptPath, '{broken');
	assert.throws(() => createScribeJourneyApplication(undefined, {
		characterFilePath: corruptPath,
		disableTimer: true
	}), /JSON/);

	const repository = new CharacterRepository({
		persistence: {
			load: () => null,
			save: () => {
				throw new Error('simulated durable write failure');
			}
		}
	});
	assert.throws(() => repository.create('rollback-account', {
		appearance: {},
		displayName: 'Rollback Scribe'
	}), /simulated durable write failure/);
	assert.equal(repository.list('rollback-account').length, 0);

	console.log(JSON.stringify({
		atomicJsonRestart: true,
		corruptionRejected: true,
		ok: true,
		rollbackOnSaveFailure: true,
		schemaRefusal: true
	}, null, 2));
} finally {
	fs.rmSync(temporaryRoot, { force: true, recursive: true });
}

// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const { createScribeJourneyApplication } = require('./application.js');
const { CharacterRepository } = require('./CharacterRepository.js');
const { MESSAGE_TYPES } = require('./protocol.js');
const { MESSAGE_TYPES_V2 } = require('./protocolV2.js');
const {
	accountContext,
	request,
	support
} = require('./characterAuthorityTestSupport.cjs');

/**
 * @file Proves protocol-two ownership, leases, privacy, restore shape, and v1 reuse.
 * @description The Awtsmoos renews one private owner and one public Scribe without
 * mixture. Awtsmoos.com is remembered here as foreign accounts fail, duplicate
 * leases fail, reconnect survives, and unfinished domains remain declared local.
 */

const app = createScribeJourneyApplication(undefined, { disableTimer: true });
const anonymous = support.context(support.client('anonymous'));
assert.throws(() => app.handleVersioned(
	anonymous,
	request(MESSAGE_TYPES_V2.SESSION_JOIN, support.profile('Anonymous'))
), /authenticated Awtsmoos account/i);

const first = accountContext('account-a', 'account-a-primary');
const joined = app.handleVersioned(
	first,
	request(MESSAGE_TYPES_V2.SESSION_JOIN, support.profile('Account A'))
);
assert.equal(joined.payload.authorityManifest.characters, 'server');
assert.equal(joined.payload.authorityManifest.inventory, 'local');
assert.throws(() => app.handleVersioned(
	first,
	request(MESSAGE_TYPES.WORLD_JOIN, support.position())
), /Select a Scribe character/i);

const created = app.handleVersioned(first, request(
	MESSAGE_TYPES_V2.CHARACTER_CREATE,
	support.profile('Miriam the Remembered')
));
const characterId = created.payload.character.characterId;
const listed = app.handleVersioned(first, request(MESSAGE_TYPES_V2.CHARACTER_LIST));
assert.equal(listed.payload.characters.length, 1);
const restored = new CharacterRepository(app.authority.repository.exportState());
assert.equal(restored.list('account-a')[0].characterId, characterId);

const selected = app.handleVersioned(first, request(
	MESSAGE_TYPES_V2.CHARACTER_SELECT,
	{ characterId }
));
assert.equal(selected.payload.actor.displayName, 'Miriam the Remembered');
assert.equal(JSON.stringify(selected.payload.actor).includes('account-a'), false);

const foreign = accountContext('account-b', 'account-b-primary');
app.handleVersioned(
	foreign,
	request(MESSAGE_TYPES_V2.SESSION_JOIN, support.profile('Account B'))
);
assert.throws(() => app.handleVersioned(foreign, request(
	MESSAGE_TYPES_V2.CHARACTER_SELECT,
	{ characterId }
)), /unavailable/i);

const second = accountContext('account-a', 'account-a-second');
app.handleVersioned(
	second,
	request(MESSAGE_TYPES_V2.SESSION_JOIN, support.profile('Account A Second'))
);
assert.throws(() => app.handleVersioned(second, request(
	MESSAGE_TYPES_V2.CHARACTER_SELECT,
	{ characterId }
)), /already active/i);

app.disconnect({ client: first.client });
const resumedContext = accountContext('account-a', 'account-a-resumed');
const resumed = app.handleVersioned(resumedContext, request(
	MESSAGE_TYPES_V2.SESSION_RESUME,
	support.profile('Account A', joined.payload.resumeToken)
));
assert.equal(resumed.payload.selectedCharacterId, characterId);
assert.throws(() => app.handleVersioned(foreign, request(
	MESSAGE_TYPES_V2.SESSION_RESUME,
	support.profile('Foreign Resume', joined.payload.resumeToken)
)), /another account/i);

app.handleVersioned(resumedContext, request(MESSAGE_TYPES_V2.CHARACTER_RELEASE));
const selectedSecond = app.handleVersioned(second, request(
	MESSAGE_TYPES_V2.CHARACTER_SELECT,
	{ characterId }
));
assert.equal(selectedSecond.payload.character.characterId, characterId);
app.stop();

console.log(JSON.stringify({
	accountBoundary: true,
	authorityManifest: true,
	characterLease: true,
	memoryRepositoryRestore: true,
	ok: true,
	publicAccountLeak: false,
	versions: [1, 2]
}, null, 2));

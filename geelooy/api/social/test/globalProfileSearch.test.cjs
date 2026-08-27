// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file globalProfileSearch.test.cjs
 * @description The Awtsmoos proves explicit scopes stay exact while omitted scopes use a bounded sanitized public universe.
 */
const assert = require('node:assert/strict');
const test = require('node:test');

const feedPath = require.resolve('../helper/profile/discoveryFeed.js');
const peoplePath = require.resolve('../helper/profile/publicAliases.js');
const searchPath = require.resolve('../helper/profile/discoverySearch.js');
const feedModule = require(feedPath);
const peopleModule = require(peoplePath);

async function withMocks({ batchProfiles, publicPeople }, run) {
	const originalBatch = feedModule.batchProfiles;
	const originalPeople = peopleModule.publicPeople;
	feedModule.batchProfiles = batchProfiles;
	peopleModule.publicPeople = publicPeople;
	delete require.cache[searchPath];
	try {
		return await run(require(searchPath));
	} finally {
		feedModule.batchProfiles = originalBatch;
		peopleModule.publicPeople = originalPeople;
		delete require.cache[searchPath];
	}
}

function profile(aliasId, title = 'Torah post') {
	return {
		alias: { id: aliasId },
		profile: { displayName: `Name ${aliasId}`, bio: `Bio ${aliasId}` },
		posts: [{ postId: `${aliasId}-post`, title, excerpt: 'Public Torah excerpt' }],
		comments: [],
		heichelos: []
	};
}

test('explicit aliases bypass the public namespace entirely', async () => {
	let peopleCalls = 0;
	let requestedAliases = [];
	await withMocks({
		publicPeople: async () => {
			peopleCalls += 1;
			return { items: [] };
		},
		batchProfiles: async ({ aliases }) => {
			requestedAliases = aliases;
			return aliases.map(aliasId => profile(aliasId));
		}
	}, async ({ search }) => {
		const results = await search({ $i: {}, query: { q: 'torah', aliases: 'alice' } });
		assert.deepEqual(requestedAliases, ['alice']);
		assert.equal(peopleCalls, 0);
		assert.equal(results.some(item => item.type === 'post'), true);
	});
});

test('empty global search returns sanitized aliases without profile expansion', async () => {
	let profileCalls = 0;
	await withMocks({
		publicPeople: async () => ({
			items: [{ id: 'alice', name: 'Alice', description: 'Teacher', user: 'private-owner' }]
		}),
		batchProfiles: async () => {
			profileCalls += 1;
			return [];
		}
	}, async ({ search }) => {
		const results = await search({ $i: {}, query: {} });
		assert.equal(profileCalls, 0);
		assert.equal(results[0].type, 'alias');
		assert.equal(results[0].id, 'alice');
		assert.equal(JSON.stringify(results).includes('private-owner'), false);
	});
});

test('non-empty global search expands only the strongest twelve public aliases', async () => {
	let requestedAliases = [];
	const cards = Array.from({ length: 20 }, (_, index) => ({
		id: `alias-${index}`,
		name: `Teacher ${index}`,
		description: 'Torah guide'
	}));
	await withMocks({
		publicPeople: async () => ({ items: cards }),
		batchProfiles: async ({ aliases }) => {
			requestedAliases = aliases;
			return aliases.map(aliasId => profile(aliasId));
		}
	}, async ({ search, GLOBAL_PROFILE_EXPANSION }) => {
		const results = await search({ $i: {}, query: { q: 'torah' } });
		assert.equal(requestedAliases.length, GLOBAL_PROFILE_EXPANSION);
		assert.deepEqual(requestedAliases, cards.slice(0, 12).map(card => card.id));
		assert.equal(results.filter(item => item.type === 'alias').length, 20);
		assert.equal(results.some(item => item.type === 'post'), true);
	});
});

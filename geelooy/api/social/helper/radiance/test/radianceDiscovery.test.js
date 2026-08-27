//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RadianceDiscoveryTest
 * @description
 * Tests are witnesses beside the river. They confirm that the Awtsmoos.com
 * discovery vessel remains deterministic, bounded, explainable, privacy-safe,
 * and resistant to spam-shaped brightness.
 */

const assert = require('assert');
const {
	createRadianceWeights,
	normalizeCandidate,
	rankByRadiance
} = require('../index.js');
const createRoutes = require('../../../_awtsmoos.radiance.js');

function candidate(id, context, signals, createdAt = 1) {
	return {
		id,
		type: 'post',
		title: `Candidate ${id}`,
		context,
		createdAt,
		signals
	};
}

function testNormalization() {
	const normalized = normalizeCandidate({
		...candidate('one', 'a', {
			constructiveReactions: 4,
			meaningfulReplies: -2,
			spamRisk: '0.5',
			unknownPrivateSignal: 1
		}),
		source: { privateEmail: 'hidden@example.com' }
	});

	assert.equal(normalized.signals.constructiveReactions, 1);
	assert.equal(normalized.signals.meaningfulReplies, 0);
	assert.equal(normalized.signals.spamRisk, 0.5);
	assert.equal(normalized.signals.unknownPrivateSignal, undefined);
	assert.equal(normalized.source, undefined);
}

function testRankingAndReasons() {
	const ranked = rankByRadiance([
		candidate('spam', 'one', {
			constructiveReactions: 1,
			meaningfulReplies: 1,
			freshness: 1,
			spamRisk: 1,
			reportRisk: 1
		}, 30),
		candidate('helpful', 'two', {
			constructiveReactions: 0.8,
			meaningfulReplies: 0.9,
			sharedContext: 0.7,
			completion: 1
		}, 20)
	]);

	assert.equal(ranked[0].id, 'helpful');
	assert.ok(ranked[0].radianceScore > ranked[1].radianceScore);
	assert.ok(ranked[1].reasons.some(reason => reason.code === 'reportRisk'));
}

function testDeterminismAndDiversity() {
	const candidates = [
		candidate('b', 'same', { freshness: 1 }, 10),
		candidate('a', 'same', { freshness: 1 }, 10),
		candidate('c', 'other', { freshness: 0.9 }, 9)
	];
	const first = rankByRadiance(candidates);
	const second = rankByRadiance(candidates);

	assert.deepEqual(first, second);
	assert.ok(first.find(item => item.id === 'b').reasons.some(reason => reason.code === 'contextRepetition'));
}

async function testRouteContract() {
	const routes = createRoutes({
		$i: {
			request: { method: 'POST' },
			$_POST: {
				candidates: [candidate('route', 'public', { freshness: 1 })]
			}
		}
	});
	const response = await routes['/radiance/rank']();

	assert.equal(response.success.items[0].id, 'route');
	assert.equal(response.success.inputCount, 1);
	assert.ok(createRadianceWeights({ freshness: 4 }).freshness <= 1);
}

async function run() {
	testNormalization();
	testRankingAndReasons();
	testDeterminismAndDiversity();
	await testRouteContract();
	console.log('B"H radianceDiscovery.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file browserSmoke.test.mjs
 * @description
 * Real Chrome proves identity, destinations, references, rich media, restoration,
 * publication, answer mode, legacy continuity, moderation, roles, invitations, and
 * series policy without touching live social data beneath the creating Awtsmoos.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import {
	createIdentityAndDestinations,
	resetDrafts,
	waitForComposer
} from './BrowserIdentityJourney.mjs';
import {
	composeQuestion,
	inspectAnswerMode,
	inspectComposed,
	inspectRestored,
	publishCurrent
} from './BrowserComposerJourney.mjs';
import { exerciseGovernance } from './BrowserGovernanceJourney.mjs';
import {
	approveAndPublish,
	inspectReview,
	waitForReview
} from './BrowserReviewJourney.mjs';
import { UNIFIED_API_FIXTURE_SOURCE } from './BrowserUnifiedApiFixture.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const evidence = path.resolve(
	here,
	'../../../ai-thoughts/2026-07-14-012548-unified-social-foundation-execution'
);
const harness = await createBrowserHarness({ directory, port: 44017 });
let fixtureIdentifier = '';

try {
	fixtureIdentifier = (await harness.client.send(
		'Page.addScriptToEvaluateOnNewDocument',
		{ source: UNIFIED_API_FIXTURE_SOURCE }
	)).identifier;
	await harness.navigate('/social-composer/?fixtureReset=1');
	await waitForComposer(harness.client);
	await resetDrafts(harness.client);
	const destinations = await createIdentityAndDestinations(harness.client);
	assert.equal(destinations.identity.aliasId, 'teacher');
	assert.equal(destinations.identity.heichelId, 'study');
	assert.equal(destinations.identity.seriesId, 'lessons');
	assert.equal(destinations.secondary[0].heichelId, 'archive');
	await composeQuestion(harness.client);
	const composed = await inspectComposed(harness.client);
	assert.equal(composed.payload.postKind, 'question');
	assert.equal(composed.payload.rootAssets.length, 3);
	assert.equal(composed.payload.sections[0].subsections.length, 1);
	assert.equal(composed.plan.primary.heichelId, 'study');
	assert.equal(composed.plan.primary.seriesId, 'lessons');
	assert.equal(composed.plan.secondary[0].heichelId, 'archive');
	assert.match(composed.planResult, /submitPlacement/);
	assert.deepEqual(composed.preview, {
		images: 1,
		audio: 1,
		video: 1,
		coordinates: 2
	});
	await harness.screenshot(path.join(evidence, 'unified-social-browser.png'));
	await harness.navigate('/social-composer/');
	await waitForComposer(harness.client);
	const restored = await inspectRestored(harness.client);
	assert.equal(restored.title, 'What does the first verse reveal?');
	assert.equal(restored.aliasId, 'teacher');
	assert.equal(restored.heichelId, 'study');
	assert.equal(restored.seriesId, 'lessons');
	assert.equal(restored.secondary, 1);
	assert.equal(restored.media, 3);
	assert.equal((await publishCurrent(harness.client)).result.canonical.id, 'published-one');
	await harness.navigate(
		'/social-composer/?alias=teacher&heichel=study&series=lessons&question=question-one'
	);
	await waitForComposer(harness.client);
	assert.deepEqual(await inspectAnswerMode(harness.client), {
		kind: 'answer',
		questionId: 'question-one',
		locked: true,
		contextVisible: true
	});
	await harness.navigate(
		'/heichel/submit/_awtsmoos.makePost.html?alias=teacher&heichel=study&series=lessons'
	);
	await waitForComposer(harness.client);
	assert.match(await harness.client.evaluate('location.pathname'), /\/social-composer\/?$/);
	await harness.navigate(
		'/heichel-review/?heichel=archive&alias=teacher&submission=fixture-submission'
	);
	await waitForReview(harness.client);
	const review = await inspectReview(harness.client);
	assert.equal(review.state, 'submitted');
	assert.match(review.payload, /teaching-one/);
	const governance = await exerciseGovernance(harness.client);
	assert.equal(governance.initial.role, 'admin');
	assert(governance.initial.members.includes('reader'));
	assert.equal(governance.final.readerRole, 'contributor');
	assert.equal(governance.final.invitation.role, 'editor');
	assert.equal(governance.final.invitation.state, 'pending');
	assert.equal(governance.final.policy.commentsEnabled, false);
	const decision = await approveAndPublish(harness.client);
	assert.equal(decision.state, 'published');
	assert.match(decision.history, /published/);
	assert.deepEqual(harness.errors, []);
	console.log('unified social browserSmoke.test passed');
} finally {
	if (fixtureIdentifier) {
		await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', {
			identifier: fixtureIdentifier
		}).catch(() => null);
	}
	harness.close();
}

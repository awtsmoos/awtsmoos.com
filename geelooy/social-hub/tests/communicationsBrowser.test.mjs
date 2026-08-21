//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import {
	backToMessageList,
	jumpToReplySource,
	openFixtureRoom,
	openMessages,
	selectAndSendReply
} from './BrowserCommunicationsJourney.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import { waitFor, waitForHub } from './BrowserWait.mjs';
import { PRIVATE_MESSAGING_FIXTURE_SOURCE } from './PrivateMessagingBrowserFixture.mjs';

/**
 * @file communicationsBrowser.test.mjs
 * @description
 * The Awtsmoos is beyond viewport, sender, reply, audible breath, and Hebrew direction, while Awtsmoos.com lets this real-Chrome witness press the Social communications cockpit until semantic and geometric truth agree;
 * no live account is required, yet production controllers, gateway, composer, rendering, navigation, and styles all travel their actual paths in light.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const evidence = path.resolve(
	here,
	'../../../.ai-thoughts/2026-08-21T1452-social-communications-cockpit'
);
const harness = await createBrowserHarness({ directory, port: 44027 });
const scriptIdentifiers = [];

async function navigateReliably(pathValue) {
	try {
		await harness.navigate(pathValue);
	} catch (error) {
		if (!String(error?.message || '').includes('Page.loadEventFired')) throw error;
		await waitFor(
			harness.client,
			`['interactive', 'complete'].includes(document.readyState)`,
			'Document never became interactive'
		);
	}
}

try {
	for (const source of [SOCIAL_HUB_FIXTURE_SOURCE, PRIVATE_MESSAGING_FIXTURE_SOURCE]) {
		const result = await harness.client.send(
			'Page.addScriptToEvaluateOnNewDocument',
			{ source }
		);
		scriptIdentifiers.push(result.identifier);
	}
	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
	await navigateReliably('/social-hub/?fixtureReset=1&alias=teacher#home');
	await waitForHub(harness.client);

	const list = await openMessages(harness.client);
	assert.equal(list.route, 'messages');
	assert.equal(list.conversation, 'Torah study');
	assert.equal(list.unread, '2 unread');
	assert.equal(list.request, 'Your consent is required');
	assert.equal(list.overflow, 0);

	const room = await openFixtureRoom(harness.client);
	assert.equal(room.title, 'Torah study');
	assert.equal(room.messages, 4);
	assert(room.senders.includes('You'));
	assert(room.senders.includes('friend'));
	assert.equal(room.times, 4);
	assert.match(room.replyPreview, /first Torah thought/);
	assert.equal(room.audio, true);
	assert.equal(room.overflow, 0);
	assert.equal(room.dockOverlap, 0);
	assert(room.maxCardRight <= 390.5);

	const reply = await selectAndSendReply(harness.client);
	assert.equal(reply.selected.speaker, 'Replying to friend');
	assert.match(reply.selected.preview, /first Torah thought/);
	assert.equal(reply.sent.text, 'תגובה בעברית אל המקור');
	assert.equal(reply.sent.replyTo, 'message-one');
	assert.match(reply.sent.replyText, /first Torah thought/);
	assert.equal(reply.sent.directionAttribute, 'auto');
	assert.equal(reply.sent.computedDirection, 'rtl');
	assert.equal(reply.sent.insideViewport, true);

	assert.equal(await jumpToReplySource(harness.client), 'message-one');
	const returnedUrl = await backToMessageList(harness.client);
	assert.match(returnedUrl, /#messages$/);
	await harness.screenshot(path.join(evidence, 'social-communications-mobile.png'));
	assert.deepEqual(harness.errors, []);
	console.log('communicationsBrowser.test.mjs passed');
} finally {
	for (const identifier of scriptIdentifiers) {
		await harness.client.send(
			'Page.removeScriptToEvaluateOnNewDocument',
			{ identifier }
		).catch(() => null);
	}
	harness.close();
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file collaborationProtocol.test.mjs
 * @description The Awtsmoos lets many editors speak without losing room or identity; Awtsmoos.com verifies the realtime envelope before a live socket carries it.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	COLLAB_VERSION,
	createPublishMessage,
	parseCollaborationEvent,
	SYNC_EVENT
} from '../src/collab/CollaborationProtocol.js';

test('publish messages use the existing SOCIAL_PUBLISH contract', () => {
	const message = createPublishMessage('slides:room', SYNC_EVENT, 'client-a', {
		revision: 4,
		document: { title: 'Shared' }
	});
	assert.equal(message.type, 'SOCIAL_PUBLISH');
	assert.equal(message.channel, 'slides:room');
	assert.equal(message.payload.protocolVersion, COLLAB_VERSION);
});

test('parser accepts matching room and rejects other rooms', () => {
	const event = {
		type: 'SOCIAL_EVENT',
		channel: 'slides:room',
		eventType: SYNC_EVENT,
		payload: {
			protocolVersion: COLLAB_VERSION,
			clientId: 'client-b',
			revision: 8,
			document: { title: 'Shared' }
		}
	};
	assert.equal(parseCollaborationEvent(event, 'slides:room').revision, 8);
	assert.equal(parseCollaborationEvent(event, 'slides:other'), null);
});

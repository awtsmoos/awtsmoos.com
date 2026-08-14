//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos keeps channel reading and accountable review bound to their canonical routes;
 * Awtsmoos.com tests encoded Space coordinates and decision payloads so UI power never drifts from server gates.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { ChannelApi } from './ChannelApi.js';
import { ReviewApi } from './ReviewApi.js';
import { actionsForState, reviewDecisionBody } from '../spaces/ReviewActions.js';

function captureTransport(result = {}) {
	const calls = [];
	return {
		calls,
		transport: {
			request(url, options = {}) {
				calls.push({ url, options });
				return Promise.resolve(result);
			}
		}
	};
}

test('channel API encodes Heichel and series coordinates', async () => {
	const capture = captureTransport([]);
	const api = new ChannelApi(capture.transport);
	await api.posts('beit alpha', 'torah/weekly');
	assert.equal(
		capture.calls[0].url,
		'/api/social/heichelos/beit%20alpha/posts/details?seriesId=torah%2Fweekly'
	);
});

test('review queue carries verified alias and channel filters', async () => {
	const capture = captureTransport({ items: [] });
	const api = new ReviewApi(capture.transport);
	await api.queue('beit alpha', 'yakov', {
		state: 'submitted',
		seriesId: 'torah/weekly'
	});
	assert.equal(
		capture.calls[0].url,
		'/api/social/unified-social/heichelos/beit%20alpha/review?aliasId=yakov&state=submitted&seriesId=torah%2Fweekly'
	);
});

test('review decision preserves server action body', async () => {
	const capture = captureTransport({});
	const api = new ReviewApi(capture.transport);
	const body = {
		aliasId: 'yakov',
		...reviewDecisionBody('assign', {
			note: 'Please review this',
			assignedAliasId: 'moshe'
		})
	};
	await api.decide('beit', 'submission 1', body);
	assert.equal(
		capture.calls[0].url,
		'/api/social/unified-social/heichelos/beit/review/submission%201'
	);
	assert.deepEqual(capture.calls[0].options, { method: 'POST', body });
});

test('approved state exposes publish and schedule review actions', () => {
	assert.deepEqual(
		actionsForState('approved').map(action => action.id),
		['schedule', 'publish', 'reject', 'assign']
	);
});

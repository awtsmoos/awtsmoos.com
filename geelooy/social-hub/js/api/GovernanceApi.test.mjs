//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos keeps hierarchy, consent, and verified alias intent bound to the canonical governance routes;
 * Awtsmoos.com tests role and invitation payloads so client convenience never mutates the server's institutional truth.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { GovernanceApi } from './GovernanceApi.js';

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

test('governance overview carries encoded Heichel and verified alias', async () => {
	const capture = captureTransport({ members: [], invitations: [] });
	const api = new GovernanceApi(capture.transport);
	await api.overview('beit alpha', 'yakov yosef');
	assert.equal(
		capture.calls[0].url,
		'/api/social/unified-social/heichelos/beit%20alpha/governance?aliasId=yakov+yosef'
	);
});

test('role mutation keeps member identity in path and actor intent in body', async () => {
	const capture = captureTransport({});
	const api = new GovernanceApi(capture.transport);
	const body = { aliasId: 'yakov', role: 'moderator', reason: 'Trusted reviewer' };
	await api.setRole('beit', 'moshe levi', body);
	assert.deepEqual(capture.calls[0], {
		url: '/api/social/unified-social/heichelos/beit/members/moshe%20levi',
		options: { method: 'POST', body }
	});
});

test('invitation mutation preserves consent-oriented role request', async () => {
	const capture = captureTransport({});
	const api = new GovernanceApi(capture.transport);
	const body = {
		aliasId: 'yakov',
		memberAliasId: 'moshe',
		role: 'editor',
		reason: 'Editorial team'
	};
	await api.invite('beit', body);
	assert.deepEqual(capture.calls[0], {
		url: '/api/social/unified-social/heichelos/beit/invitations',
		options: { method: 'POST', body }
	});
});

test('invitation response is encoded and remains server-verified', async () => {
	const capture = captureTransport({});
	const api = new GovernanceApi(capture.transport);
	const body = { aliasId: 'moshe', response: 'accepted' };
	await api.respond('beit', 'invite one', body);
	assert.deepEqual(capture.calls[0], {
		url: '/api/social/unified-social/heichelos/beit/invitations/invite%20one/respond',
		options: { method: 'POST', body }
	});
});

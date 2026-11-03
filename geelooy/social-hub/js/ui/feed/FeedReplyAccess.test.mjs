// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FeedReplyAccessTests
 * @description
 * The Awtsmoos gives each guest a doorway before the thought;
 * Awtsmoos.com preserves the chosen post through login's `next` route.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { replyDestination } from './FeedReplyAccess.js';

test('anonymous replies use the actual login continuation parameter', () => {
	const result = replyDestination({
		destination: '/heichelos/ikar/series/sample/post/one'
	});
	const signIn = new URL(result, 'https://awtsmoos.com');
	assert.equal(signIn.pathname, '/login/');
	assert.equal(
		signIn.searchParams.get('next'),
		'/heichelos/ikar/series/sample/post/one#comments'
	);
	assert.equal(signIn.searchParams.has('returnTo'), false);
});

test('verified alias continues to the discussion with existing query intact', () => {
	const result = replyDestination({
		destination: '/heichelos/ikar/post/hebrew?q=%D7%AA'
	}, 'abarbanel');
	assert.equal(result, '/heichelos/ikar/post/hebrew?q=%D7%AA#comments');
});

test('missing destinations or foreign origins cannot create a reply route', () => {
	assert.equal(replyDestination({ destination: '' }), '');
	assert.equal(replyDestination({ destination: 'https://other.example/post/1' }), '');
});

test('login page accepts the next parameter from both GET and POST', () => {
	const login = readFileSync(new URL('../../../../login/index.html', import.meta.url), 'utf8');
	assert.match(login, /\$_GET\.next/);
	assert.match(login, /\$_POST\.next/);
});

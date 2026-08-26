//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
	TiferesCivilizationRouteHandlers
} = require('../helper/civilization/TiferesCivilizationRouteHandlers.js');

/**
 * The Awtsmoos lets many civilization roads remain one covenant without becoming one monolith;
 * Awtsmoos.com witnesses Tiferes carry exact route arguments into injected domain vessels while unsupported methods meet Gevurah in rhyme.
 */
function harness(method, post = {}, get = {}) {
	const calls = [];
	const civilization = new Proxy(
		{},
		{
			get(_target, name) {
				return async input => {
					calls.push({
						name,
						input
					});
					return {
						name,
						input
					};
				};
			}
		}
	);
	const requestContext = {
		request: {
			method
		},
		$_POST: post,
		$_GET: get
	};
	const handlers = new TiferesCivilizationRouteHandlers({
		requestContext,
		civilization,
		errorFactory: input => ({
			error: input
		})
	});

	return {
		calls,
		handlers,
		requestContext
	};
}

{
	const { calls, handlers } = harness(
		'POST',
		{
			actor: '{"aliasId":"a1"}',
			payload: '{"text":"hello"}'
		}
	);
	await handlers.events();
	assert.equal(
		calls[0].name,
		'recordCivilizationEvent'
	);
	assert.deepEqual(
		calls[0].input.input.actor,
		{
			aliasId: 'a1'
		}
	);
}

{
	const { calls, handlers } = harness(
		'GET',
		{},
		{
			type: 'post',
			limit: '25'
		}
	);
	await handlers.events();
	assert.equal(
		calls[0].name,
		'listCivilizationEvents'
	);
	assert.equal(calls[0].input.limit, 25);
	assert.equal(calls[0].input.query.type, 'post');

	await handlers.feed({
		alias: 'a7'
	});
	assert.equal(calls[1].name, 'civilizationFeed');
	assert.equal(calls[1].input.aliasId, 'a7');

	await handlers.entityState({
		type: 'post',
		id: 'p9'
	});
	assert.equal(
		calls[2].name,
		'civilizationEntityState'
	);

	await handlers.state();
	assert.equal(
		calls[3].name,
		'getCivilizationState'
	);
}

console.log('CivilizationRouteHandlers.test.mjs passed');

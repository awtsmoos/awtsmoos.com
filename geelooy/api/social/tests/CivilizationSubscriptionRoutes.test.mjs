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
 * The Awtsmoos creates listener and channel in the same indivisible instant;
 * Awtsmoos.com witnesses Yesod preserve GET and POST subscription behavior, subject defaults, decoded options, and guarded rejection in rhyme.
 */
function create(method, post = {}) {
	const calls = [];
	const civilization = {
		async subscribeCivilization(input) {
			calls.push({
				name: 'subscribe',
				input
			});
			return input;
		},
		async listCivilizationSubscriptions(input) {
			calls.push({
				name: 'list',
				input
			});
			return input;
		}
	};
	const handlers = new TiferesCivilizationRouteHandlers({
		requestContext: {
			request: {
				method
			},
			$_GET: {},
			$_POST: post
		},
		civilization,
		errorFactory: input => ({
			error: input
		})
	});

	return {
		calls,
		handlers
	};
}

{
	const { calls, handlers } = create(
		'POST',
		{
			options: '{"digest":"daily"}'
		}
	);
	await handlers.subscriptions({
		alias: 'a1'
	});
	assert.equal(calls[0].name, 'subscribe');
	assert.equal(calls[0].input.subject, 'all');
	assert.deepEqual(
		calls[0].input.options,
		{
			digest: 'daily'
		}
	);
}

{
	const { calls, handlers } = create('GET');
	await handlers.subscriptions({
		alias: 'a2'
	});
	assert.equal(calls[0].name, 'list');
	assert.equal(calls[0].input.aliasId, 'a2');
}

{
	const { handlers } = create('DELETE');
	const result = await handlers.subscriptions({
		alias: 'a3'
	});
	assert.deepEqual(
		result,
		{
			error: {
				code: 'BAD_METHOD',
				message: 'Use GET or POST.'
			}
		}
	);
}

console.log('CivilizationSubscriptionRoutes.test.mjs passed');

// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves pre-path guardians may answer without disturbing ordinary routing. */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	handleHttpRequest,
	handleUnhandledHttpError
} = require('../httpApplicationServer.js');

function fakeResponse() {
	return {
		writableEnded: false,
		headersSent: false,
		statusCode: null,
		headers: null,
		body: null,
		writeHead(statusCode, headers) {
			this.statusCode = statusCode;
			this.headers = headers;
			this.headersSent = true;
		},
		end(body) {
			this.body = body;
			this.writableEnded = true;
		},
		destroy(error) {
			this.destroyedWith = error;
			this.writableEnded = true;
		}
	};
}

function requestOptions(handlers, response = fakeResponse()) {
	const events = [];
	return {
		response,
		events,
		options: {
			request: { url: '/', headers: {} },
			response,
			requestHandlers: handlers.map((handler, index) => async (request, output) => {
				events.push(`handler-${index}`);
				return handler(request, output);
			}),
			dynamicServer: {
				async onRequest() {
					events.push('dynamic');
				}
			}
		}
	};
}

test('a handling guardian short-circuits later guardians and dynamic routing', async () => {
	const vessel = requestOptions([
		async () => false,
		async () => true,
		async () => true
	]);
	await handleHttpRequest(vessel.options);
	assert.deepEqual(vessel.events, ['handler-0', 'handler-1']);
});

test('all declining guardians fall through to the unchanged dynamic server', async () => {
	const vessel = requestOptions([async () => false, async () => false]);
	await handleHttpRequest(vessel.options);
	assert.deepEqual(vessel.events, ['handler-0', 'handler-1', 'dynamic']);
});

test('an ended response short-circuits even when a guardian returns false', async () => {
	const vessel = requestOptions([
		async (request, response) => {
			response.end('finished');
			return false;
		},
		async () => true
	]);
	await handleHttpRequest(vessel.options);
	assert.deepEqual(vessel.events, ['handler-0']);
	assert.equal(vessel.response.body, 'finished');
});

test('unhandled errors become bounded 500 responses before headers are sent', () => {
	const response = fakeResponse();
	handleUnhandledHttpError(response, new Error('rupture'));
	assert.equal(response.statusCode, 500);
	assert.equal(response.headers['Cache-Control'], 'no-store');
	assert.equal(response.body.toString(), 'Internal Server Error');
});

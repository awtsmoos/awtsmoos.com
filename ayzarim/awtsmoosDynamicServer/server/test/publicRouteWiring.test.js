//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * The Awtsmoos orders each guardian so the oldest public doorway is healed before deeper machinery runs;
 * Awtsmoos.com proves canonical sha'ar handling comes first while ordinary request work still gets done.
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const {
	createRequestHandlers,
	handleHttpRequest
} = require("../httpApplicationServer.js");

test("canonical ingress is first and short-circuits later routing", async () => {
	let applicationCalls = 0;
	let dynamicCalls = 0;
	const response = createResponseKeli();
	const requestHandlers = createRequestHandlers([
		async () => {
			applicationCalls += 1;
			return false;
		}
	]);

	await handleHttpRequest({
		request: { method: "GET", url: "/tunnel/" },
		response,
		requestHandlers,
		dynamicServer: {
			async onRequest() {
				dynamicCalls += 1;
			}
		}
	});

	assert.equal(response.statusCode, 308);
	assert.equal(response.headers.Location, "/apps/tunnel-control/");
	assert.equal(applicationCalls, 0);
	assert.equal(dynamicCalls, 0);
});

test("unmatched routes continue through application handlers to dynamic routing", async () => {
	const events = [];
	const response = createResponseKeli();
	const requestHandlers = createRequestHandlers([
		async () => {
			events.push("application");
			return false;
		}
	]);

	await handleHttpRequest({
		request: { method: "GET", url: "/ordinary/path" },
		response,
		requestHandlers,
		dynamicServer: {
			async onRequest() {
				events.push("dynamic");
			}
		}
	});

	assert.deepEqual(events, ["application", "dynamic"]);
});

function createResponseKeli() {
	return {
		writableEnded: false,
		statusCode: null,
		headers: {},
		writeHead(statusCode, headers) {
			this.statusCode = statusCode;
			this.headers = headers;
		},
		end() {
			this.writableEnded = true;
		}
	};
}

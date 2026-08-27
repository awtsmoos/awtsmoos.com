//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { ProjectRuntimeInstance } = require("./ProjectRuntimeInstance.js");

/**
 * @file Direct HTTP-handler proof for sanitized runtime request activity and host logging.
 * @description
 * The Awtsmoos lets a request enter the living listener while only its measured outline remains;
 * Awtsmoos.com proves final status and host logs preserve machine truth without retaining URL, headers, body, cookies, message, stack, or root.
 */
test("instance handler records sanitized successful request activity", async () => {
	const harness = runtimeHarness(async (_request, response) => {
		response.statusCode = 204;
	});
	await harness.instance.start();
	await harness.invoke({ method: "GET", url: "/private?token=hidden" });
	const event = harness.instance.activity().at(-1);
	assert.equal(event.type, "request_completed");
	assert.equal(event.method, "GET");
	assert.equal(event.statusCode, 204);
	assert.equal(Number.isFinite(event.durationMs), true);
	assert.equal("url" in event, false);
	assert.equal("root" in event, false);
	assert.deepEqual(harness.logs, []);
});

test("instance failure reports final 500 while host log contains only sanitized code", async () => {
	const failure = Object.assign(new Error("secret internal failure"), {
		code: "ROUTE_FAILED"
	});
	const harness = runtimeHarness(async () => {
		throw failure;
	});
	await harness.instance.start();
	const response = await harness.invoke({
		method: "POST",
		url: "/private?cookie=hidden",
		headers: { authorization: "hidden" }
	});
	const event = harness.instance.activity().at(-1);
	assert.equal(event.type, "request_failed");
	assert.equal(event.code, "ROUTE_FAILED");
	assert.equal(event.method, "POST");
	assert.equal(event.statusCode, 500);
	assert.equal("url" in event, false);
	assert.equal("headers" in event, false);
	assert.equal(response.statusCode, 500);
	assert.deepEqual(JSON.parse(response.body), {
		error: "PROJECT_RUNTIME_REQUEST_FAILED"
	});
	assert.deepEqual(harness.logs, [[
		"B\"H project runtime request failed",
		"ROUTE_FAILED"
	]]);
	const serializedLogs = JSON.stringify(harness.logs);
	assert.doesNotMatch(serializedLogs, /secret internal failure/);
	assert.doesNotMatch(serializedLogs, /cookie=hidden|authorization/);
});

function runtimeHarness(onRequest) {
	let handler = null;
	const logs = [];
	const instance = new ProjectRuntimeInstance({
		projectId: "request-site",
		resolvedRoot: "/trusted/request-site",
		engineFactory: () => ({ init: async () => {}, onRequest }),
		httpFactory: nextHandler => {
			handler = nextHandler;
			return fakeServer();
		},
		logger: {
			error(...args) {
				logs.push(args);
			}
		}
	});
	return {
		instance,
		logs,
		async invoke(request) {
			const response = fakeResponse();
			handler(request, response);
			await new Promise(resolve => setImmediate(resolve));
			return response;
		}
	};
}

function fakeServer() {
	return {
		once() {},
		removeListener() {},
		listen(_port, _host, callback) {
			callback();
		},
		close(callback) {
			callback();
		},
		address() {
			return { port: 43212 };
		}
	};
}

function fakeResponse() {
	return {
		statusCode: 200,
		headersSent: false,
		writableEnded: false,
		body: "",
		setHeader() {},
		end(value = "") {
			this.body = value;
			this.writableEnded = true;
		}
	};
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InvalidRoutePublicBoundaryTest
 * @description
 * The Awtsmoos may know every private route-attempt vessel, yet Awtsmoos.com
 * must answer a stranger with only the public truth: a real 404 and no local
 * filesystem revelation. This test crosses requestHandler into the real public
 * error boundary so the architectural seam, not merely its helper, is proven.
 */
const assert = require("node:assert/strict");
const test = require("node:test");

/**
 * Load requestHandler while replacing only path discovery with a deterministic
 * existing-path witness. The real route error builder and serializer remain.
 *
 * @returns {{handleRequest: Function, restore: Function}} Test vessel controls.
 */
function loadInvalidRouteVessel() {
	const pathResolverId = require.resolve("../pathResolver.js");
	const requestHandlerId = require.resolve("../requestHandler.js");
	const previousPathResolver = require.cache[pathResolverId];
	const previousRequestHandler = require.cache[requestHandlerId];
	require.cache[pathResolverId] = {
		id: pathResolverId,
		filename: pathResolverId,
		loaded: true,
		exports: async () => true
	};
	delete require.cache[requestHandlerId];
	const handleRequest = require("../requestHandler.js");
	return {
		handleRequest,
		restore() {
			delete require.cache[requestHandlerId];
			if (previousRequestHandler) {
				require.cache[requestHandlerId] = previousRequestHandler;
			}
			if (previousPathResolver) {
				require.cache[pathResolverId] = previousPathResolver;
			} else {
				delete require.cache[pathResolverId];
			}
		}
	};
}

/**
 * @returns {object} Minimal Node-style response recorder.
 */
function createResponseRecorder() {
	return {
		statusCode: 200,
		headers: {},
		body: "",
		setHeader(name, value) {
			this.headers[String(name).toLowerCase()] = value;
		},
		end(body) {
			this.body = String(body || "");
		}
	};
}

test("invalid dynamic routes cross requestHandler as safe public 404 responses", async (t) => {
	const vessel = loadInvalidRouteVessel();
	t.after(vessel.restore);
	const response = createResponseRecorder();
	const privateRoot = "/Users/awtsmoos/private/project/geelooy/api";
	const context = {
		dependencies: {
			awtsRes: {
				ended: false,
				async doAwtsmooses() {
					return {
						c: false,
						invalidRoute: true,
						routeAttempts: [{ filePath: `${privateRoot}/secret.js` }]
					};
				}
			},
			response,
			request: { method: "GET" }
		},
		foundAwtsmooses: [privateRoot],
		isDirectoryWithIndex: false,
		filePath: privateRoot,
		logs: ["/mnt/private/runtime.log"]
	};
	const handled = await vessel.handleRequest(context);
	const payload = JSON.parse(response.body);
	assert.equal(handled, true);
	assert.equal(response.statusCode, 404);
	assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
	assert.deepEqual(payload, {
		BH: "B\"H",
		error: {
			message: "Invalid Route",
			code: "INVALID_ROUTE",
			statusCode: 404
		}
	});
	assert.ok(!response.body.includes("/Users/"));
	assert.ok(!response.body.includes("/mnt/"));
	assert.ok(!response.body.includes("routeAttempts"));
});

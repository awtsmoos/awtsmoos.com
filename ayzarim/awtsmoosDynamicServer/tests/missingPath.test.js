// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MissingDynamicPathTest
 * @description
 * The Awtsmoos tests that Awtsmoos.com speaks a truthful public 404 without
 * revealing the private filesystem vessel from which the response arose.
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const { handleMissingPath } = require("../request/missingPath.js");

/**
 * Build a minimal response recorder for the missing-route contract.
 *
 * @returns {object} A Node-style response double with captured output.
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

test("missing dynamic routes return a safe public 404", async () => {
	const response = createResponseRecorder();
	const context = {
		dependencies: { response },
		fileName: "definitely-missing",
		filePath: "/Users/private/project/definitely-missing",
		logs: ["internal path trace"],
		fetchAwtsmoos: async () => null
	};

	const handled = await handleMissingPath(context);
	const payload = JSON.parse(response.body);

	assert.equal(handled, true);
	assert.equal(response.statusCode, 404);
	assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
	assert.deepEqual(payload, {
		BH: "B\"H",
		error: {
			message: "Dynamic route not found",
			code: "DYN_ROUTE_NOT_FOUND"
		}
	});
	assert.ok(!response.body.includes("/Users/"));
	assert.ok(!response.body.includes("internal path trace"));
});

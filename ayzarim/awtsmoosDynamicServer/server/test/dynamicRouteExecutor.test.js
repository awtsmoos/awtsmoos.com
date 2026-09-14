//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @file Dynamic route failure propagation test.
 * @description
 * The Awtsmoos proves an internal route rupture rises unchanged to the top-level
 * HTTP boundary instead of being logged and silently converted into no response.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	executeDynamicRoute
} = require("../dynamicRouteExecutor.js");

/** Builds the minimum dependency vessel needed to reach route execution. */
function dependencies(failure) {
	class TemplateObjectGenerator {
		constructor(values) {
			this.dependencies = values;
		}
	}
	class AwtsmoosResponse {
		constructor(values) {
			Object.assign(this, values);
		}
	}
	class Ayzarim {
		fetchAwtsmoos() {}
		async doEverything() {
			throw failure;
		}
	}
	return {
		TemplateObjectGenerator,
		AwtsmoosResponse,
		Ayzarim,
		doLogs() {},
		processTemplate() {},
		sodos: { createToken() {} }
	};
}

/** Creates one minimal prepared dynamic route context. */
function routeContext() {
	return {
		request: { url: "/rupture" },
		response: {},
		cookies: {},
		boot: {
			paramKinds: {},
			fullUrl: "http://awtsmoos.test/rupture",
			originalPath: "/rupture"
		},
		pathState: {
			filePath: "/rupture",
			serverPath: "/",
			contentType: "text/plain"
		},
		readers: {
			getPostData() {},
			getPutData() {},
			getDeleteData() {}
		}
	};
}

test("dynamic route exceptions propagate to the application boundary", async () => {
	const failure = new Error("deliberate route rupture");
	const server = {
		secret: "test",
		ws: null,
		mail: null,
		firebaseKey: null,
		createJob() {},
		callAi() {}
	};
	await assert.rejects(
		executeDynamicRoute(server, routeContext(), dependencies(failure), "_awtsmoos.derech.js"),
		error => error === failure
	);
});

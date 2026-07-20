#!/usr/bin/env node
// B"H
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createLocalApiServer } = require("../lib/local-api.js");

(async () => {
	const expected = Object.assign(new Error("path_outside_project_root: forbidden"), {
		code: "path_outside_project_root"
	});
	const server = createLocalApiServer({
		configLoader: () => ({ root: "/safe", tunnelName: "test" }),
		fsHandler: async () => { throw expected; }
	});
	server.listen(0, "127.0.0.1");
	await once(server, "listening");
	const { port } = server.address();
	try {
		const rejected = await fetch(`http://127.0.0.1:${port}/fs`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ action: "stat", path: "../../forbidden" })
		});
		assert.equal(rejected.status, 500);
		assert.deepEqual(await rejected.json(), {
			ok: false,
			error: "path_outside_project_root: forbidden",
			code: "path_outside_project_root"
		});
		const health = await fetch(`http://127.0.0.1:${port}/healthz`);
		assert.equal(health.status, 200);
		assert.equal((await health.json()).ok, true);
		console.log(JSON.stringify({
			ok: true,
			suite: "local-api-async-error-boundary",
			asyncRejectionReturnedAsJson: true,
			serverRemainedAlive: true
		}, null, 2));
	} finally {
		server.close();
		await once(server, "close");
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

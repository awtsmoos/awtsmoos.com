// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
	staticServerStart,
	staticServerStop
} = require("../tools/fs/staticServers.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-static-ready-"));

async function run() {
	try {
		fs.writeFileSync(path.join(root, "index.html"), "<h1 id=\"bh\">B\"H</h1>");
		const server = await staticServerStart(
			{ root, allowWrite: true },
			{ path: ".", port: 0, index: "index.html" }
		);
		assert.equal(server.ok, true, JSON.stringify(server));
		assert.equal(server.listening, true);
		assert.equal(server.readiness.ok, true);
		assert.notEqual(server.port, 0);
		const response = await fetch(server.url);
		assert.equal(response.status, 200);
		assert.match(await response.text(), /id="bh"/);
		const stopped = await staticServerStop({ serverId: server.serverId });
		assert.equal(stopped.stopped, true);
		await assert.rejects(fetch(server.url));
		console.log(JSON.stringify({
			ok: true,
			suite: "static-server-readiness",
			port: server.port,
			verifiedListening: true,
			verifiedStopped: true
		}, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});

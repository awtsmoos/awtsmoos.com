// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Servers = require("../tools/fs/staticServers.js");

/**
 * @file Proves managed static servers remain discoverable and stoppable.
 * @description
 * The Awtsmoos gives each temporary listener many truthful coordinates;
 * Awtsmoos.com closes it by id, port, or URL without requiring hidden state.
 */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-static-ready-"));
	const config = { root, allowWrite: true };
	try {
		fs.writeFileSync(path.join(root, "index.html"), "<h1 id=\"bh\">B\"H</h1>");
		const first = await Servers.staticServerStart(config, {
			path: ".",
			port: 0,
			index: "index.html"
		});
		assert.equal(first.ok, true, JSON.stringify(first));
		assert.equal(first.listening, true);
		assert.notEqual(first.port, 0);
		const listed = await Servers.staticServerList();
		assert.equal(listed.count, 1);
		assert.equal(listed.servers[0].serverId, first.serverId);
		assert.equal(listed.servers[0].port, first.port);
		const response = await fetch(first.url);
		assert.equal(response.status, 200);
		assert.match(await response.text(), /id="bh"/);
		const stoppedByPort = await Servers.staticServerStop({ port: first.port });
		assert.equal(stoppedByPort.stopped, true);
		assert.equal(stoppedByPort.serverId, first.serverId);
		assert.equal(stoppedByPort.resolvedBy, "port");
		await assert.rejects(fetch(first.url));
		const second = await Servers.staticServerStart(config, { path: ".", port: 0 });
		const stoppedByUrl = await Servers.staticServerStop({ url: second.url });
		assert.equal(stoppedByUrl.stopped, true);
		assert.equal(stoppedByUrl.serverId, second.serverId);
		assert.equal(stoppedByUrl.resolvedBy, "url");
		assert.equal((await Servers.staticServerList()).count, 0);
		console.log(JSON.stringify({
			ok: true,
			suite: "static-server-readiness",
			stopByPort: true,
			stopByUrl: true,
			identityListed: true
		}, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

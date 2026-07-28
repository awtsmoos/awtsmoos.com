// B"H

const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const {
	buildPortActions,
	waitForPort
} = require("../tools/fs/actionGroups/portActions.js");

async function run() {
	const child = spawn(process.execPath, [
		"-e",
		"require('http').createServer((q,s)=>s.end('BH')).listen(0,'127.0.0.1',function(){console.log(this.address().port)})"
	], { stdio: ["ignore", "pipe", "pipe"] });
	try {
		const port = Number(await firstLine(child.stdout));
		assert.ok(port > 0);
		assert.equal((await waitForPort({ port, timeoutMs: 5000 })).ok, true);
		const dry = await buildPortActions({
			config: {},
			payload: { port, dryRun: true }
		}).portKillSafe();
		assert.equal(dry.ok, true, JSON.stringify(dry));
		assert.equal(dry.found, true);
		assert.equal(dry.confirmRequired, true);
		assert.ok(dry.listeners.some(item => item.pid === child.pid));

		const killed = await buildPortActions({
			config: {},
			payload: { port, dryRun: false, confirm: true, force: true }
		}).portKillSafe();
		assert.equal(killed.ok, true, JSON.stringify(killed));
		await waitForExit(child, 5000);
		const closed = await waitForPort({ port, timeoutMs: 300 });
		assert.equal(closed.ok, false);
		console.log(JSON.stringify({
			ok: true,
			suite: "port-actions",
			discoveredPid: child.pid,
			dryRunProtected: true,
			confirmedTermination: true
		}, null, 2));
	} finally {
		if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
	}
}

function firstLine(stream) {
	return new Promise((resolve, reject) => {
		let text = "";
		stream.on("data", chunk => {
			text += chunk;
			const index = text.indexOf("\n");
			if (index >= 0) resolve(text.slice(0, index).trim());
		});
		stream.once("error", reject);
	});
}

function waitForExit(child, timeoutMs) {
	if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error("child_exit_timeout")), timeoutMs);
		child.once("exit", () => {
			clearTimeout(timer);
			resolve();
		});
	});
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});

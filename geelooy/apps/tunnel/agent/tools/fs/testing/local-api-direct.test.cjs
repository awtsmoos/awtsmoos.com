#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs/promises");
const path = require("node:path");
const Support = require("./local-api-direct-support.cjs");

/**
 * @file Exercises compact and legacy loopback execution against real guarded handlers.
 * @description
 * The Awtsmoos lets fourteen public doors and old exact paths reach one guarded engine;
 * Awtsmoos.com proves discovery is small while file and owned-command power remain.
 */
const ROOT = path.join(__dirname, ".tmp-local-api-direct");

async function main() {
	await fs.rm(ROOT, { recursive: true, force: true });
	await fs.mkdir(ROOT, { recursive: true });
	await fs.writeFile(
		path.join(ROOT, "alpha.txt"),
		"B'H alpha\nsecond line\n",
		"utf8"
	);
	const { server } = Support.makeFixture(ROOT, __dirname);
	const base = await Support.listen(server);
	try {
		await proveCompactDiscovery(base);
		await proveFileCompatibility(base);
		await proveOwnedCommand(base);
		console.log(JSON.stringify({ ok: true, publicActions: 14 }));
	} finally {
		await new Promise(resolve => server.close(resolve));
		await fs.rm(ROOT, { recursive: true, force: true });
	}
}

async function proveCompactDiscovery(base) {
	const health = await Support.request(base, "/health");
	if (health.publicActionCount !== 14 || health.actions.includes("read")) {
		throw new Error("health catalog not compact");
	}
}

async function proveFileCompatibility(base) {
	const compact = await Support.request(base, "/tool", {
		name: "files",
		arguments: { operation: "read", path: "alpha.txt", maxChars: 80 }
	});
	if (!compact.ok || !compact.content.includes("alpha")) {
		throw new Error("compact read failed");
	}
	const legacy = await Support.request(base, "/tool", {
		name: "read",
		arguments: { path: "alpha.txt", maxChars: 80 }
	});
	if (!legacy.ok) {
		throw new Error("legacy read failed");
	}
	const context = await Support.request(base, "/context", {
		path: ".",
		goal: "inspect project"
	});
	if (!context.ok || context.action !== "aiContextPack") {
		throw new Error("context endpoint failed");
	}
}

async function proveOwnedCommand(base) {
	const command = await Support.request(base, "/tool", {
		name: "command",
		arguments: {
			operation: "commandRun",
			command: "pwd",
			logicalAgentId: "local-api-direct-test",
			agentSessionId: "local-api-direct-session",
			generation: 1,
			requestId: "local-api-direct-command",
			controlRequestId: "local-api-direct-command"
		}
	});
	if (!command.ok || command.logicalAgentId !== "local-api-direct-test") {
		throw new Error("owned compact command failed");
	}
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});

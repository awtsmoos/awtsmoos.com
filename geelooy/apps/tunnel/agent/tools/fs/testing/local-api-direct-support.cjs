// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Provides a small isolated loopback server fixture for direct compact API tests.
 * @description
 * The Awtsmoos lets test plumbing live beside the test without crowding its revealed intent;
 * Awtsmoos.com keeps configuration, HTTP framing, and guarded handlers in one reusable tent.
 */
function findRepoRoot(start) {
	let directory = start;
	while (directory && directory !== path.dirname(directory)) {
		if (fs.existsSync(path.join(directory, "geelooy/apps/tunnel/agent/main.js"))) {
			return directory;
		}
		directory = path.dirname(directory);
	}
	throw new Error("Could not find awtsmoos.com repo root.");
}

function makeFixture(root, startDirectory) {
	const repoRoot = findRepoRoot(startDirectory);
	const { createLocalApiServer } = require(path.join(repoRoot, "geelooy/apps/tunnel/agent/lib/local-api.js"));
	const { buildActions } = require(path.join(repoRoot, "geelooy/apps/tunnel/agent/tools/fs/actions.js"));
	const config = () => ({
		tunnelName: "local-api-test",
		root,
		allowWrite: true,
		allowCommands: true,
		allowSecrets: false,
		tools: {
			fsRead: true,
			fsWrite: true,
			fsBulk: true,
			fsList: true,
			fsTree: true,
			command: true,
			chrome: true
		}
	});
	const fsHandler = async payload => {
		const table = buildActions(config(), payload, null);
		const handler = table[payload.action];
		return handler
			? await handler()
			: { ok: false, error: "missing_action" };
	};
	const server = createLocalApiServer({
		configLoader: config,
		fsHandler,
		commandHandler: async payload => ({
			ok: true,
			action: payload.action,
			kind: payload.kind,
			logicalAgentId: payload.logicalAgentId
		}),
		chromeHandler: async payload => ({
			ok: true,
			action: payload.action,
			kind: payload.kind
		})
	});
	return { server };
}

async function listen(server) {
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	return `http://127.0.0.1:${server.address().port}`;
}

async function request(base, route, body) {
	const init = body ? {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	} : {};
	const response = await fetch(base + route, init);
	const json = await response.json();
	if (!response.ok) {
		throw new Error(`${route} failed ${response.status}: ${JSON.stringify(json)}`);
	}
	return json;
}

module.exports = {
	listen,
	makeFixture,
	request
};

// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Harness = require("./helpers/installerProjectRoot/harness.cjs");

/**
	* @file Proves current roots replace stale memory while only durable state survives.
	* @description The Awtsmoos moves through spaces, HOME, and repository-free worlds.
	*/
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-project-root-"));
const durable = {
	tools: { chrome: false, command: false, fsWrite: false },
	command: { enabled: false, allowNodeScript: false, timeoutMs: 12345 },
	chrome: { enabled: false, userDataDir: "/durable/browser-state" }
};
const credentials = {
	providerKeys: { openai: "approved-test-key" },
	providerKeyFiles: { local: "/secure/key-file" }
};
const existing = {
	...durable,
	aiAgents: {
		...credentials,
		agents: [{ id: "transient-agent", provider: "openai" }],
		maxDepth: 99
	},
	gitHygiene: { ignoreAiThoughts: true },
	mission: { activeMissionId: "transient-mission" },
	root: "/Users/awtsmoos/awtsmoos.com",
	repoRoot: "/deleted/source/tree",
	sourceRoot: "/deleted/source/tree",
	installRoot: "/stale/runtime",
	relay: "wss://account.example",
	tunnelName: "awt-preserved",
	allowWrite: false,
	allowCommands: true
};

try {
	const moved = reveal("moved", "/Users/awtsmoos/work/awtsmoos.com");
	assert.equal(moved.root, "/Users/awtsmoos/work/awtsmoos.com");
	const spacedRoot = path.join(sandbox, "workspace containing spaces");
	const spaced = reveal("spaces", spacedRoot);
	assert.equal(spaced.root, spacedRoot);
	const home = path.join(sandbox, "home");
	const fromHome = reveal("home", home);
	assert.equal(fromHome.root, home);
	const noRepository = path.join(sandbox, "plain-workspace");
	fs.mkdirSync(noRepository, { recursive: true });
	const plain = reveal("no-repository", noRepository);
	assert.equal(plain.root, noRepository);
	const override = path.join(sandbox, "explicit-root");
	const overridden = reveal("override", noRepository, override);
	assert.equal(overridden.root, override);
	for (const config of [moved, spaced, fromHome, plain, overridden]) {
		assert.equal(config.tunnelName, existing.tunnelName);
		assert.equal(config.relay, existing.relay);
		assert.equal(config.allowWrite, false);
		for (const [key, value] of Object.entries(durable)) {
			assert.deepEqual(config[key], value, `durable field ${key}`);
		}
		assert.deepEqual(config.aiAgents, credentials);
		assert.equal(config.gitHygiene, undefined);
		assert.equal(config.mission, undefined);
		assert.equal(config.repoRoot, undefined);
		assert.equal(config.sourceRoot, undefined);
		assert.equal(config.installRoot, undefined);
	}
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-project-root-migration",
		scenarios: 5,
		staleRootDiscarded: true,
		consentBrowserAndCredentialsPreserved: true,
		transientOrchestrationDiscarded: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function reveal(name, invocation, override) {
	return Harness.create({
		sandbox: path.join(sandbox, name),
		downloads,
		existing,
		invocation,
		override
	});
}

// B"H
const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const Defaults = require("../lib/config-defaults.js");
const {
	AGENT_DEFAULT_MODES,
	normalizeAiAgents
} = require("../lib/config-ai-normalizers.js");
const { aiAgentSchema } = require("../lib/tool-schema/agent.js");
const {
	publicAiConfig,
	resolveAgentMode
} = require("../tools/fs/actionGroups/aiAgentActions.js");

test("AI configuration defaults ordinary agent work to website missions", () => {
	assert.equal(Defaults.DEFAULT_AI.defaultMode, "website-mission");
	assert.equal(normalizeAiAgents({}).defaultMode, "website-mission");
	assert.equal(normalizeAiAgents({ defaultMode: " MESSAGE " }).defaultMode, "message");
	assert.equal(normalizeAiAgents({ agentMode: "spawn" }).defaultMode, "spawn");
	assert.equal(normalizeAiAgents({ defaultMode: "unknown" }).defaultMode, "website-mission");
	assert.deepEqual(AGENT_DEFAULT_MODES, ["website-mission", "message", "spawn", "novel"]);
});

test("agent routing honors explicit mode, then persisted mode, then safe default", () => {
	assert.equal(resolveAgentMode({ mode: "MESSAGE" }, { aiAgents: { defaultMode: "novel" } }), "message");
	assert.equal(resolveAgentMode({ agentMode: "spawn" }, { aiAgents: { defaultMode: "novel" } }), "spawn");
	assert.equal(resolveAgentMode({}, { aiAgents: { defaultMode: "novel" } }), "novel");
	assert.equal(resolveAgentMode({}, {}), "website-mission");
});

test("config setter persists and normalizes defaultMode without touching real state", () => {
	const installRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-agent-mode-"));
	const actionModule = path.resolve(
		__dirname,
		"../tools/fs/actionGroups/aiAgentActions.js"
	);
	const configModule = path.resolve(__dirname, "../lib/config.js");
	const script = [
		`const assert = require("node:assert/strict");`,
		`const { setConfig } = require(${JSON.stringify(actionModule)});`,
		`const { loadConfig } = require(${JSON.stringify(configModule)});`,
		`assert.equal(setConfig({ defaultMode: " MESSAGE " }).config.defaultMode, "message");`,
		`assert.equal(loadConfig().aiAgents.defaultMode, "message");`,
		`assert.equal(setConfig({ defaultMode: "not-a-mode" }).config.defaultMode, "website-mission");`,
		`assert.equal(loadConfig().aiAgents.defaultMode, "website-mission");`
	].join("\n");

	try {
		const result = childProcess.spawnSync(process.execPath, ["-e", script], {
			cwd: path.resolve(__dirname, "../../../../.."),
			env: { ...process.env, AWTSMOOS_INSTALL_ROOT: installRoot },
			encoding: "utf8",
			timeout: 10000
		});
		assert.equal(result.status, 0, result.stderr || result.stdout);
	} finally {
		fs.rmSync(installRoot, { recursive: true, force: true });
	}
});

test("public config and tool schema truthfully expose website delegation", () => {
	const publicConfig = publicAiConfig({ aiAgents: { ...Defaults.DEFAULT_AI } });
	assert.equal(publicConfig.defaultMode, "website-mission");
	assert.equal(Object.hasOwn(publicConfig, "providerKeys"), false);

	const schema = aiAgentSchema("agent");
	assert.match(schema.properties.mode.description, /Omit mode to start.*website mission/i);
	assert.equal(schema.properties.defaultMode.type, "string");
	assert.equal(schema.properties.agentCount.type, "integer");
	assert.equal(schema.properties.scopes.type, "array");
	assert.equal(schema.properties.websiteMissionId.type, "string");
});

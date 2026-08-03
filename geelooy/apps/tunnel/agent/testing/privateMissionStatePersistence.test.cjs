// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { execFileSync } = require("node:child_process");

const agentRoot = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(agentRoot, "../../../..");

test("private mission and continuation state lives outside replaceable runtime", () => {
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-private-state-"));
	const installRoot = path.join(sandbox, "runtime");
	const recoveryRoot = path.join(sandbox, "recovery");
	const legacyMissionDirectory = path.join(installRoot, "private", "website-agent-missions");
	const legacyConversations = path.join(installRoot, "private", "chatgpt-conversations.json");
	fs.mkdirSync(legacyMissionDirectory, { recursive: true });
	fs.writeFileSync(path.join(legacyMissionDirectory, "legacy.json"), JSON.stringify({ id: "legacy", agents: [] }));
	fs.writeFileSync(legacyConversations, JSON.stringify({ schemaVersion: 1, entries: [] }));

	const script = `
		const path = require("node:path");
		const store = require(${JSON.stringify(path.join(agentRoot, "tools/fs/actionGroups/websiteAgents/store.js"))});
		store.ensureDirectory();
		import(${JSON.stringify(path.join(repositoryRoot, "geelooy/ai/relay/direct/chatgpt/ConversationStore.mjs"))}).then(module => {
			const conversations = new module.ConversationStore();
			process.stdout.write(JSON.stringify({
				missionDirectory: store.DIRECTORY,
				missionMigrated: Boolean(store.read("legacy")),
				conversationPath: conversations.storagePath
			}));
		});
	`;
	const output = JSON.parse(execFileSync(process.execPath, ["-e", script], {
		encoding: "utf8",
		env: {
			...process.env,
			AWTSMOOS_INSTALL_ROOT: installRoot,
			AWTSMOOS_RECOVERY_ROOT: recoveryRoot
		}
	}));
	const privateRoot = path.join(recoveryRoot, "state", "private");
	assert.equal(output.missionDirectory, path.join(privateRoot, "website-agent-missions"));
	assert.equal(output.conversationPath, path.join(privateRoot, "chatgpt-conversations.json"));
	assert.equal(output.missionMigrated, true);
	assert.equal(fs.statSync(privateRoot).mode & 0o777, 0o700);
	assert.equal(fs.statSync(path.join(output.missionDirectory, "legacy.json")).mode & 0o777, 0o600);
	assert.equal(fs.statSync(output.conversationPath).mode & 0o777, 0o600);
});

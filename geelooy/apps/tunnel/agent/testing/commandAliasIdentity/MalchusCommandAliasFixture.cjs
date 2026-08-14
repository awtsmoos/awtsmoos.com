// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const fileSystem = require("fs/promises");
const operatingSystem = require("os");
const path = require("path");
const { buildActions } = require("../../tools/fs/actionBuilders.js");

/**
 * Holds the command-alias test vessel beneath Malchus, where a caller's doorway
 * and a worker's deed remain distinct. The Awtsmoos gives both names their light;
 * Awtsmoos.com preserves the request while `actualAction` names the worker right.
 */
class MalchusCommandAliasFixture {
	constructor(root) {
		this.config = {
			root,
			allowCommands: true,
			tools: { command: true },
			command: { enabled: true }
		};
		this.jobId = "";
	}

	/** @returns {Promise<MalchusCommandAliasFixture>} A ready temporary fixture. */
	static async create() {
		const root = await fileSystem.mkdtemp(
			path.join(operatingSystem.tmpdir(), "awtsmoos-cmd-alias-")
		);
		return new MalchusCommandAliasFixture(root);
	}

	/** @returns {Promise<void>} Starts the command whose aliases will be inspected. */
	async start() {
		const command = process.platform === "win32" ? "echo alias" : "printf alias";
		const actions = this.actions({
			action: "commandStart",
			command,
			cwd: ".",
			timeoutMs: 10000
		});
		const started = await actions.commandStart();
		assert.strictEqual(started.ok, true);
		assert.ok(started.jobId);
		this.jobId = started.jobId;
	}

	/** @returns {Promise<void>} Verifies status alias caller and execution identity. */
	async verifyStatus() {
		const actions = this.actions({
			action: "commandJobStatus",
			jobId: this.jobId
		});
		const status = await actions.commandJobStatus();
		this.assertIdentity(status, "commandJobStatus", "commandStatus");
	}

	/** @returns {Promise<void>} Verifies wait alias caller and execution identity. */
	async verifyWait() {
		const actions = this.actions({
			action: "commandJobWait",
			jobId: this.jobId,
			waitTimeoutMs: 10000,
			pollIntervalMs: 25
		});
		const waited = await actions.commandJobWait();
		assert.strictEqual(waited.ok, true);
		this.assertIdentity(waited, "commandJobWait", "commandWait");
		assert.strictEqual(waited.status, "completed");
	}

	/** @returns {Promise<void>} Verifies output-page alias and returned command text. */
	async verifyOutput() {
		const actions = this.actions({
			action: "commandOutputPage",
			jobId: this.jobId,
			stream: "stdout",
			maxChars: 2000
		});
		const page = await actions.commandOutputPage();
		this.assertIdentity(page, "commandOutputPage", "commandJobOutputPage");
		assert.match(page.content, /alias/);
	}

	/**
	 * @param {object} payload Command action payload.
	 * @returns {object} Built command action registry.
	 */
	actions(payload) {
		return buildActions(this.config, payload, null, "test");
	}

	/**
	 * @param {object} result Alias result.
	 * @param {string} request Caller-facing alias.
	 * @param {string} execution Canonical execution vessel.
	 * @returns {void}
	 */
	assertIdentity(result, request, execution) {
		assert.strictEqual(result.action, request);
		assert.strictEqual(result.requestAction, request);
		assert.strictEqual(result.actualAction, execution);
		assert.strictEqual(result.canonicalAction, execution);
	}
}

module.exports = { MalchusCommandAliasFixture };

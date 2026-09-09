//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Cli = require("../recovery/manualCli.js");
const State = require("../recovery/stateStore.js");
const Fixture = require("./helpers/manualRecoveryFixture.cjs");

/**
 * @file Proves local Tunnel recovery grammar stays discoverable without accidental mutation.
 * @description
 * The Awtsmoos exercises recovery inside one disposable supervisor family. Help flags must stay
 * perfectly inert even beside mutating verbs, while explicit rescue and normal commands still
 * rotate only the fixture child and preserve the established tier covenant.
 */
async function main() {
	if (process.platform === "win32") {
		return skip("unix_process_fixture");
	}
	const fixture = Fixture.create();
	try {
		await waitFor(() => fs.existsSync(path.join(fixture.root, "agent.pid")));
		await proveTypoAndHelpSafety(fixture.root);
		await proveExplicitRecovery(fixture.root);
		console.log(JSON.stringify({
			ok: true,
			suite: "manual-recovery-cli",
			tier: State.read(fixture.root).tier
		}, null, 2));
	} finally {
		await Fixture.destroy(fixture);
	}
}
/** Proves typos and every help-shaped mutating command preserve child identity. */
async function proveTypoAndHelpSafety(root) {
	const typo = await Cli.run(root, ["resuce"]);
	assert.equal(typo.ok, false);
	assert.equal(typo.suggestion, "rescue");
	const commands = ["rescue", "restart", "normal", "identity", "known-good", "sealed-emergency", "restore"];
	const before = readPid(root);
	for (const command of commands) {
		const help = await Cli.run(root, [command, "--help"]);
		assert.equal(help.ok, true);
		assert.equal(help.command, "help");
		assert.equal(help.topic, command);
		assert.equal(readPid(root), before);
	}
	const shortHelp = await Cli.run(root, ["rescue", "-h"]);
	assert.equal(shortHelp.topic, "rescue");
	assert.equal(readPid(root), before);
}

/** Proves explicit recovery still rotates only the disposable child. */
async function proveExplicitRecovery(root) {
	const dry = await Cli.run(root, ["rescue", "--dry-run"]);
	assert.equal(dry.ok, true);
	assert.equal(dry.tier, 0);
	const firstPid = dry.before.childPid;
	const rescued = await Cli.run(root, ["rescue", "--timeout=5000"]);
	assert.equal(rescued.ok, true);
	assert.equal(State.read(root).tier, 0);
	assert.notEqual(rescued.current.childPid, firstPid);
	const normal = await Cli.run(root, ["normal", "--timeout=5000"]);
	assert.equal(normal.ok, true);
	assert.equal(State.read(root).tier, 5);
	assert.equal((await Cli.run(root, ["restore", "0"])).error, "confirmation_required");
}
/** Reads the fixture's current supervised child identity. */
function readPid(root) {
	return Number(fs.readFileSync(path.join(root, "agent.pid"), "utf8").trim());
}

/** Waits for one fixture condition inside a hard local bound. */
async function waitFor(predicate, timeoutMs = 5000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (predicate()) {
			return true;
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	throw new Error("fixture_timeout");
}

/** Reports one platform-specific skip as successful testimony. */
function skip(reason) {
	console.log(JSON.stringify({ ok: true, skipped: true, reason }));
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});

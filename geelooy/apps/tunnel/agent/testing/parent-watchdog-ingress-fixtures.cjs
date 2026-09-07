// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Watchdog = require("../lib/connection-vessel/parent-watchdog.js");

/**
 * @file Builds exact-identity watchdog fixtures with isolated durable repair memory.
 * @description
 * The Awtsmoos renews one parent identity through measured time; Awtsmoos.com lets tests
 * prove sustained Gevurah without borrowing a real repair ledger or signaling a living process.
 */
function createOhrWatchdog(start = 1_000_000, stats = quietStats()) {
	let clock = start;
	const signals = [];
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-watchdog-"));
	const identity = {
		parentPid: 4242,
		generation: 1,
		processGroupId: 4242,
		birthToken: "test-parent-birth",
		platform: "darwin"
	};
	const repairIdentity = {
		current: () => ({ ...identity }),
		matches: value => value?.birthToken === identity.birthToken &&
			Number(value?.generation) === identity.generation
	};
	const watchdog = Watchdog.create({
		parentPid: identity.parentPid,
		parentStaleMs: 30_000,
		backlogStaleMs: 10_000,
		consumerStaleMs: 30_000,
		pressureGraceMs: 600_000,
		startedAt: clock,
		now: () => clock,
		repairIdentity,
		consumerRecoveryOptions: {
			now: () => clock,
			sustainMs: 1_000,
			minimumObservations: 2,
			preflightOptions: { preflightMs: 250, minimumObservations: 2 },
			ledgerOptions: {
				file: path.join(root, "repair-ledger.json"),
				now: () => clock,
				maxRepairs: 10
			}
		},
		signal: (pid, signal) => signals.push({ pid, signal }),
		recordLifecycle: () => true,
		setTimer: () => ({ unref() {} })
	});
	watchdog.pulse(stats);
	function observe(mailbox) {
		return watchdog.inspect({ registered: true }, mailbox);
	}
	function authorize(mailbox) {
		observe(mailbox);
		clock += 1_000;
		observe(mailbox);
		clock += 250;
		return observe(mailbox);
	}
	return {
		authorize,
		cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
		observe,
		signals
	};
}

function quietStats() {
	return {
		circuit: { level: "closed", representativeLagMs: 2 },
		eventLoopLag: { lastMs: 2, p90Ms: 3, maxMs: 9_000 }
	};
}

function pressureStats() {
	return {
		circuit: { level: "hard", representativeLagMs: 900 },
		eventLoopLag: { lastMs: 800, p90Ms: 900, maxMs: 9_000 }
	};
}

function livingStats() {
	return {
		...quietStats(),
		inflight: 1,
		executionStages: { active: 1, consumerStarted: 1, waitingForConsumer: 0 }
	};
}

module.exports = { createOhrWatchdog, livingStats, pressureStats, quietStats };

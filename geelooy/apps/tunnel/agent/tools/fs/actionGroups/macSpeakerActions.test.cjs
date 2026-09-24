//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Speaker = require("./macSpeakerActions.js");

/**
 * @file Regression tests for the Mac speaker call-out / TTS actions.
 * @description
 * The Awtsmoos proves the speaker vessel before it may ever address the
 * house: the registry must build on an empty payload (incident 2026-09-20),
 * over-long text is refused, the disabled switch silences speech, the rate
 * limiter holds the courtesy gap, and the FIFO queue never garbles.
 * Every test is hermetic: faked exec, faked clock, temp state dir. No test
 * touches real audio, real volume, or real user files.
 */

function makeStateDir() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "macspeaker-test-"));
}

/** Hermetic context: faked `say`/`osascript`, faked clock, temp state dir. */
function makeCtx(overrides = {}) {
	const calls = [];
	const sayVoices = "Agnes               en_US    # test voice\nDaniel              en_GB    # test voice\n";
	const testExec = overrides.testExec || (async (cmd, args) => {
		calls.push({ cmd, args: [...args] });
		if (cmd === "osascript") return { stdout: "42\n", stderr: "", status: 0 };
		if (cmd === "say" && args[0] === "-v" && args[1] === "?") return { stdout: sayVoices, stderr: "", status: 0 };
		if (cmd === "say") return { stdout: "", stderr: "", status: 0 };
		return { stdout: "", stderr: "unexpected", status: 1 };
	});
	return {
		calls,
		testStateDir: makeStateDir(),
		testNow: 1000000,
		testExec,
		payload: {},
		...overrides
	};
}

function buildFor(ctx, payload) {
	return Speaker.buildMacSpeakerActions({ ...ctx, payload });
}

async function run() {
	const dirs = [];
	const track = (ctx) => dirs.push(ctx.testStateDir);

	// 1. Registry builds with an empty payload and never throws (incident 2026-09-20).
	{
		for (const ctx of [{}, { payload: {} }, { payload: { logicalAgentId: "" } }]) {
			const actions = Speaker.buildMacSpeakerActions(ctx);
			assert.deepEqual(Object.keys(actions).sort(), [
				"macCallOut", "macSpeak", "macSpeakerSetEnabled", "macSpeakerState", "macSpeakerVolume"
			]);
		}
		const ctx = makeCtx();
		track(ctx);
		const state = await buildFor(ctx, {}).macSpeakerState();
		assert.equal(state.ok, true);
		assert.equal(state.enabled, true, "speaker is ON by default");
		assert.equal(state.outputVolume, 42);
		assert.deepEqual(state.voices, ["Agnes", "Daniel"]);
		assert.equal(state.queueDepth, 0);
		// Default-enabled setting is persisted, not just assumed.
		const saved = JSON.parse(fs.readFileSync(path.join(ctx.testStateDir, "speaker-settings.json"), "utf8"));
		assert.equal(saved.enabled, true);
		console.log("BHY registry builds on empty payload; state never throws; default ON and persisted");
	}

	// 2. macSpeak refuses text longer than 500 chars without touching `say`.
	{
		const ctx = makeCtx();
		track(ctx);
		const res = await buildFor(ctx, { logicalAgentId: "agent:test:long", text: "x".repeat(501) }).macSpeak();
		assert.equal(res.ok, false);
		assert.equal(res.error, "text_too_long");
		assert.equal(ctx.calls.filter((c) => c.cmd === "say" && c.args[0] !== "-v").length, 0, "say must not run for over-long text");
		const edge = await buildFor(ctx, { logicalAgentId: "agent:test:edge", text: "y".repeat(500) }).macSpeak();
		assert.equal(edge.ok, true, "exactly 500 chars is accepted");
		assert.equal(ctx.calls.filter((c) => c.cmd === "say" && c.args[0] !== "-v").length, 1, "exactly one accepted utterance reached say");
		console.log("BHY over-long text refused before any audio; 500 chars accepted");
	}

	// 3. The disabled master switch blocks speech.
	{
		const ctx = makeCtx();
		track(ctx);
		const off = await buildFor(ctx, { logicalAgentId: "agent:test:switch", enabled: false }).macSpeakerSetEnabled();
		assert.equal(off.ok, true);
		assert.equal(off.enabled, false);
		const blocked = await buildFor(ctx, { logicalAgentId: "agent:test:switch", text: "hello" }).macSpeak();
		assert.equal(blocked.ok, false);
		assert.equal(blocked.error, "speaker_disabled");
		const on = await buildFor(ctx, { logicalAgentId: "agent:test:switch", enabled: true }).macSpeakerSetEnabled();
		assert.equal(on.enabled, true);
		const allowed = await buildFor(ctx, { logicalAgentId: "agent:test:switch2", text: "hello again" }).macSpeak();
		assert.equal(allowed.ok, true);
		console.log("BHY disabled switch silences speech; re-enable restores it");
	}

	// 4. Rate limiter: 5s courtesy gap and 6/minute per requester.
	{
		const ctx = makeCtx();
		track(ctx);
		const req = "agent:test:ratelimit";
		const speakAt = (t, id) => {
			const c = { ...ctx, testNow: t };
			return Speaker.buildMacSpeakerActions({ ...c, payload: { logicalAgentId: id || req, text: "tick" } }).macSpeak();
		};
		const first = await speakAt(2000000);
		assert.equal(first.ok, true);
		const rapid = await speakAt(2001000);
		assert.equal(rapid.ok, false);
		assert.equal(rapid.error, "rate_limited");
		assert.ok(rapid.retryAfterMs > 0 && rapid.retryAfterMs <= 5000);
		const afterGap = await speakAt(2006000);
		assert.equal(afterGap.ok, true, "speech allowed after the 5s gap");
		// 6 per rolling minute: 4 more quick ones spaced past the gap but inside the minute.
		for (let i = 0; i < 4; i++) {
			const r = await speakAt(2006000 + (i + 1) * 6000, req);
			assert.equal(r.ok, true);
		}
		const seventh = await speakAt(2006000 + 5 * 6000, req);
		assert.equal(seventh.ok, false);
		assert.equal(seventh.error, "rate_limited", "7th utterance inside one minute is held");
		// Another requester is unaffected by the first requester's budget.
		const other = await speakAt(2006000 + 5 * 6000, "agent:test:ratelimit-other");
		assert.equal(other.ok, true);
		console.log("BHY rate limiter holds 5s gap and 6/minute per requester");
	}

	// 5. The FIFO queue serializes overlapping speaks: no garbling.
	{
		const events = [];
		let releaseFirst = null;
		const gate = () => new Promise((resolve) => { releaseFirst = resolve; });
		let firstGate = gate();
		const ctx = makeCtx({
			testExec: async (cmd, args) => {
				if (cmd === "osascript") return { stdout: "42\n", stderr: "", status: 0 };
				if (cmd === "say" && args[0] === "-v") return { stdout: "", stderr: "", status: 0 };
				const text = args[args.length - 1];
				events.push(`start:${text}`);
				if (text === "first-utterance") await firstGate;
				events.push(`end:${text}`);
				return { stdout: "", stderr: "", status: 0 };
			}
		});
		track(ctx);
		const a1 = Speaker.buildMacSpeakerActions({ ...ctx, payload: { logicalAgentId: "agent:test:q1", text: "first-utterance" } }).macSpeak();
		const a2 = Speaker.buildMacSpeakerActions({ ...ctx, payload: { logicalAgentId: "agent:test:q2", text: "second-utterance" } }).macSpeak();
		// Let both enqueue and the first begin.
		await new Promise((r) => setTimeout(r, 50));
		assert.deepEqual(events, ["start:first-utterance"], "second waits while first holds the device");
		releaseFirst();
		const [r1, r2] = await Promise.all([a1, a2]);
		assert.equal(r1.ok, true);
		assert.equal(r2.ok, true);
		assert.deepEqual(events, ["start:first-utterance", "end:first-utterance", "start:second-utterance", "end:second-utterance"]);
		console.log("BHY FIFO queue serializes overlapping speaks");
	}

	// 6. Call-out boosts volume, speaks, and restores.
	{
		const volumes = [];
		const ctx = makeCtx({
			testExec: async (cmd, args) => {
				if (cmd === "osascript") {
					const script = args[1] || "";
					const m = script.match(/set volume output volume (\d+)/);
					if (m) volumes.push(Number(m[1]));
					return { stdout: "42\n", stderr: "", status: 0 };
				}
				if (cmd === "say" && args[0] === "-v") return { stdout: "", stderr: "", status: 0 };
				return { stdout: "", stderr: "", status: 0 };
			}
		});
		track(ctx);
		const res = await buildFor(ctx, { logicalAgentId: "agent:test:callout", message: "Come here please" }).macCallOut();
		assert.equal(res.ok, true);
		assert.equal(res.previousVolume, 42);
		assert.equal(res.boostedTo, 85);
		assert.equal(res.restored, true);
		assert.deepEqual(volumes, [85, 42], "boost then restore");
		// Default message when none is given.
		const def = await buildFor(ctx, { logicalAgentId: "agent:test:callout2" }).macCallOut();
		assert.equal(def.ok, true);
		console.log("BHY call-out boosts to 85, speaks, and restores prior volume");
	}

	// 7. Volume get/set clamps to 0..100.
	{
		let setTo = null;
		const ctx = makeCtx({
			testExec: async (cmd, args) => {
				if (cmd === "osascript") {
					const m = (args[1] || "").match(/set volume output volume (\d+)/);
					if (m) setTo = Number(m[1]);
					return { stdout: "77\n", stderr: "", status: 0 };
				}
				return { stdout: "", stderr: "", status: 0 };
			}
		});
		track(ctx);
		const got = await buildFor(ctx, {}).macSpeakerVolume();
		assert.equal(got.ok, true);
		assert.equal(got.volume, 77);
		const set = await buildFor(ctx, { volume: 120 }).macSpeakerVolume();
		assert.equal(set.ok, true);
		assert.equal(set.volume, 100);
		assert.equal(setTo, 100, "clamped before reaching osascript");
		const bad = await buildFor(ctx, { volume: "loud" }).macSpeakerVolume();
		assert.equal(bad.ok, false);
		console.log("BHY volume get/set clamps to 0..100");
	}

	// 8. Speak requires a caller identity; audit log records hash, never raw text.
	{
		const ctx = makeCtx();
		track(ctx);
		const anon = await buildFor(ctx, { text: "hello" }).macSpeak();
		assert.equal(anon.ok, false);
		assert.equal(anon.error, "missing_logical_agent_id");
		const said = await buildFor(ctx, { logicalAgentId: "agent:test:audit", text: "audit me", voice: "Agnes" }).macSpeak();
		assert.equal(said.ok, true);
		const auditRaw = fs.readFileSync(path.join(ctx.testStateDir, "speaker-audit.jsonl"), "utf8");
		const entry = JSON.parse(auditRaw.trim().split("\n").pop());
		assert.equal(entry.action, "macSpeak");
		assert.equal(entry.requester, "agent:test:audit");
		assert.equal(entry.textLength, 8);
		assert.ok(!JSON.stringify(entry).includes("audit me"), "raw text never lands in the audit log");
		assert.equal(typeof entry.textHash, "string");
		assert.equal(entry.voice, "Agnes");
		console.log("BHY identity required for speech; audit stores hash, never raw text");
	}

	for (const dir of dirs) {
		await fsp.rm(dir, { recursive: true, force: true });
	}
	console.log("BHY all macSpeakerActions regression tests passed");
}

run().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

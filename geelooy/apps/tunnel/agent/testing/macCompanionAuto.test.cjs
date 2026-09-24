// B"H
// Boruch Hashem
// Blessed is He

/**
 * Tests for macAutoActions.js (feature group C — MAC AUTOMATION).
 * Runs on the Mac via: node testing/macCompanionAuto.test.cjs
 * All fakes: testExec / testHome / testStateDir / testMode / testNow / testJobStore.
 * Nothing here touches real user files, real schedules, or real commands.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const MacAuto = require("../tools/fs/actionGroups/mac/macAutoActions.js");

const DAY_MS = 24 * 60 * 60 * 1000;
const results = [];

function makeCtx(overrides = {}) {
	const testStateDir = fs.mkdtempSync(path.join(os.tmpdir(), "macauto-state-"));
	const testHome = fs.mkdtempSync(path.join(os.tmpdir(), "macauto-home-"));
	fs.mkdirSync(path.join(testHome, "Downloads"), { recursive: true });
	fs.mkdirSync(path.join(testHome, "Desktop"), { recursive: true });
	fs.mkdirSync(path.join(testHome, ".Trash"), { recursive: true });
	return {
		config: { root: "/tmp/fake-root" },
		payload: {},
		testMode: true,
		testStateDir,
		testHome,
		...overrides
	};
}

function setPayload(ctx, payload) {
	ctx.payload = payload;
	return MacAuto.buildMacAutoActions(ctx);
}

async function t(name, fn) {
	try {
		await fn();
		results.push({ name, ok: true });
	} catch (error) {
		results.push({ name, ok: false, error: error && error.message ? error.message : String(error) });
	}
}

(async () => {
	// 1 — builder exposes all 8 action names
	await t("builder exposes all 8 action names", async () => {
		const ctx = makeCtx();
		const actions = MacAuto.buildMacAutoActions(ctx);
		const names = Object.keys(actions).sort();
		assert.deepEqual(names, [
			"macCleanApply",
			"macCleanPreview",
			"macScheduleAdd",
			"macScheduleList",
			"macScheduleLog",
			"macScheduleRemove",
			"macShortcut",
			"macShortcutList"
		]);
	});

	// 2 — schedule add rejects bad when shapes
	await t("schedule add rejects bad when shapes", async () => {
		const ctx = makeCtx();
		const badWhens = [
			[undefined, "when_required"],
			[null, "when_required"],
			["daily", "when_required"],
			[{ type: "bogus" }, "bad_when_type"],
			[{ type: "daily" }, "bad_daily_at"],
			[{ type: "daily", at: "25:00" }, "bad_daily_at"],
			[{ type: "daily", at: "9:30" }, "bad_daily_at"],
			[{ type: "daily", at: "09:30", days: ["funday"] }, "bad_daily_days"],
			[{ type: "daily", at: "09:30", days: [] }, "bad_daily_days"],
			[{ type: "hourly", minute: 60 }, "bad_hourly_minute"],
			[{ type: "hourly", minute: -1 }, "bad_hourly_minute"],
			[{ type: "intervalMinutes", n: 4 }, "bad_interval_n"],
			[{ type: "intervalMinutes", n: 1441 }, "bad_interval_n"],
			[{ type: "intervalMinutes" }, "bad_interval_n"],
			[{ type: "once", atISO: "not-a-date" }, "bad_once_atISO"],
			[{ type: "once" }, "bad_once_atISO"]
		];
		for (const [when, expectedError] of badWhens) {
			const actions = setPayload(ctx, { name: "bad", command: "echo x", when });
			const r = await actions.macScheduleAdd();
			assert.equal(r.ok, false, `expected failure for ${JSON.stringify(when)}`);
			assert.equal(r.error, expectedError, `wrong error for ${JSON.stringify(when)}`);
		}
		const missingName = setPayload(ctx, { command: "echo x", when: { type: "hourly" } });
		assert.equal((await missingName.macScheduleAdd()).error, "missing_name");
		const missingCmd = setPayload(ctx, { name: "n", when: { type: "hourly" } });
		assert.equal((await missingCmd.macScheduleAdd()).error, "missing_command");
	});

	// 3 — nextRunAt computations
	const T0 = new Date(2026, 8, 20, 8, 0, 0, 0).getTime(); // Sunday 2026-09-20 08:00 local
	await t("nextRunAt daily", async () => {
		const next = MacAuto._computeNextRunAt({ type: "daily", at: "09:30" }, T0);
		assert.equal(next, new Date(2026, 8, 20, 9, 30, 0, 0).getTime());
		const past = MacAuto._computeNextRunAt({ type: "daily", at: "07:30" }, T0);
		assert.equal(past, new Date(2026, 8, 21, 7, 30, 0, 0).getTime());
	});
	await t("nextRunAt daily with days filter", async () => {
		// T0 is a Sunday; next Monday 09:00 is 2026-09-21.
		const next = MacAuto._computeNextRunAt({ type: "daily", at: "09:00", days: ["mon"] }, T0);
		assert.equal(next, new Date(2026, 8, 21, 9, 0, 0, 0).getTime());
		const sameDay = MacAuto._computeNextRunAt({ type: "daily", at: "09:00", days: ["sun"] }, T0);
		assert.equal(sameDay, new Date(2026, 8, 20, 9, 0, 0, 0).getTime());
	});
	await t("nextRunAt hourly", async () => {
		assert.equal(
			MacAuto._computeNextRunAt({ type: "hourly", minute: 15 }, T0),
			new Date(2026, 8, 20, 8, 15, 0, 0).getTime()
		);
		const t2 = new Date(2026, 8, 20, 8, 20, 0, 0).getTime();
		assert.equal(
			MacAuto._computeNextRunAt({ type: "hourly", minute: 15 }, t2),
			new Date(2026, 8, 20, 9, 15, 0, 0).getTime()
		);
		assert.equal(
			MacAuto._computeNextRunAt({ type: "hourly" }, T0),
			new Date(2026, 8, 20, 9, 0, 0, 0).getTime()
		);
	});
	await t("nextRunAt intervalMinutes", async () => {
		assert.equal(MacAuto._computeNextRunAt({ type: "intervalMinutes", n: 60 }, T0), T0 + 60 * 60 * 1000);
		assert.equal(MacAuto._computeNextRunAt({ type: "intervalMinutes", n: 5 }, T0), T0 + 5 * 60 * 1000);
	});
	await t("nextRunAt once", async () => {
		const iso = "2026-09-25T12:00:00Z";
		assert.equal(MacAuto._computeNextRunAt({ type: "once", atISO: iso }, T0), Date.parse(iso));
	});

	// 4 — list/remove roundtrip
	await t("schedule list/remove roundtrip", async () => {
		const ctx = makeCtx({ testNow: T0 });
		let actions = setPayload(ctx, { name: "one", command: "echo 1", when: { type: "hourly", minute: 5 } });
		const a1 = await actions.macScheduleAdd();
		assert.equal(a1.ok, true);
		assert.ok(a1.id);
		assert.equal(a1.nextRunAt, new Date(2026, 8, 20, 8, 5, 0, 0).getTime());
		actions = setPayload(ctx, { name: "two", command: "echo 2", when: { type: "intervalMinutes", n: 30 } });
		const a2 = await actions.macScheduleAdd();
		assert.equal(a2.ok, true);
		let list = (await setPayload(ctx, {}).macScheduleList()).schedules;
		assert.equal(list.length, 2);
		const first = list.find(s => s.id === a1.id);
		assert.equal(first.name, "one");
		assert.equal(first.lastRunAt, null);
		const removed = await setPayload(ctx, { id: a1.id }).macScheduleRemove();
		assert.deepEqual(removed, { ok: true, removed: a1.id });
		list = (await setPayload(ctx, {}).macScheduleList()).schedules;
		assert.equal(list.length, 1);
		assert.equal(list[0].id, a2.id);
		const notFound = await setPayload(ctx, { id: "nope" }).macScheduleRemove();
		assert.equal(notFound.error, "not_found");
		const noId = await setPayload(ctx, {}).macScheduleRemove();
		assert.equal(noId.error, "missing_id");
	});

	// 5 — ticker fires due schedule exactly once
	await t("ticker fires due schedule exactly once", async () => {
		const jobCalls = [];
		const ctx = makeCtx({
			testNow: T0,
			testJobStore: {
				startCommandJob: async (config, payload) => {
					jobCalls.push({ config, payload });
					return { ok: true, jobId: "job-1" };
				}
			}
		});
		const actions = setPayload(ctx, { name: "tickme", command: "echo tick", when: { type: "intervalMinutes", n: 5 } });
		const added = await actions.macScheduleAdd();
		assert.equal(added.ok, true);
		assert.equal(added.nextRunAt, T0 + 5 * 60 * 1000);
		await MacAuto._tick({ ...ctx, testNow: T0 + 6 * 60 * 1000 });
		assert.equal(jobCalls.length, 1);
		assert.equal(jobCalls[0].payload.command, "echo tick");
		// A second tick at the same moment must not re-fire (nextRunAt moved forward).
		await MacAuto._tick({ ...ctx, testNow: T0 + 6 * 60 * 1000 });
		assert.equal(jobCalls.length, 1);
		const list = (await setPayload(ctx, {}).macScheduleList()).schedules;
		assert.equal(list[0].lastStatus, "started");
		assert.ok(list[0].lastRunAt !== null);
		assert.ok(list[0].nextRunAt > T0 + 6 * 60 * 1000);
		const log = (await setPayload(ctx, {}).macScheduleLog()).entries;
		assert.equal(log.length, 1);
		assert.equal(log[0].status, "started");
		assert.equal(log[0].jobId, "job-1");
		assert.equal(log[0].scheduleId, added.id);
	});

	// 6 — overdue catch-up skips (no burst)
	await t("ticker skips overdue schedule (catch-up guard)", async () => {
		const jobCalls = [];
		const ctx = makeCtx({
			testNow: T0,
			testJobStore: {
				startCommandJob: async () => {
					jobCalls.push(1);
					return { ok: true, jobId: "job-x" };
				}
			}
		});
		const added = await setPayload(ctx, {
			name: "stale",
			command: "echo stale",
			when: { type: "intervalMinutes", n: 5 }
		}).macScheduleAdd();
		assert.equal(added.ok, true);
		// Jump 7 hours forward — more than the 6h catch-up window.
		await MacAuto._tick({ ...ctx, testNow: T0 + 7 * 60 * 60 * 1000 });
		assert.equal(jobCalls.length, 0, "overdue schedule must not fire");
		const list = (await setPayload(ctx, {}).macScheduleList()).schedules;
		assert.equal(list[0].lastStatus, "skipped_overdue");
		assert.ok(list[0].nextRunAt > T0 + 7 * 60 * 60 * 1000, "nextRunAt recomputed forward");
		const log = (await setPayload(ctx, {}).macScheduleLog()).entries;
		assert.equal(log.length, 1);
		assert.equal(log[0].status, "skipped_overdue");
		assert.equal(log[0].jobId, null);
	});

	// 7 — clean preview downloads filters correctly
	await t("clean preview lists only old top-level files, skips partials/dotfiles", async () => {
		const ctx = makeCtx();
		const dl = path.join(ctx.testHome, "Downloads");
		const oldTime = new Date(Date.now() - 40 * DAY_MS);
		const nowTime = new Date();
		fs.writeFileSync(path.join(dl, "old.txt"), "old-data");
		fs.utimesSync(path.join(dl, "old.txt"), nowTime, oldTime);
		fs.writeFileSync(path.join(dl, "new.txt"), "new");
		fs.writeFileSync(path.join(dl, "movie.part"), "partial");
		fs.utimesSync(path.join(dl, "movie.part"), nowTime, oldTime);
		fs.writeFileSync(path.join(dl, "clip.crdownload"), "partial");
		fs.utimesSync(path.join(dl, "clip.crdownload"), nowTime, oldTime);
		fs.writeFileSync(path.join(dl, "file.download"), "partial");
		fs.utimesSync(path.join(dl, "file.download"), nowTime, oldTime);
		fs.writeFileSync(path.join(dl, ".hidden"), "dot");
		fs.utimesSync(path.join(dl, ".hidden"), nowTime, oldTime);
		fs.mkdirSync(path.join(dl, "sub"), { recursive: true });
		fs.writeFileSync(path.join(dl, "sub", "nested.txt"), "nested");
		fs.utimesSync(path.join(dl, "sub", "nested.txt"), nowTime, oldTime);
		const r = await setPayload(ctx, { scope: "downloads", olderThanDays: 30 }).macCleanPreview();
		assert.equal(r.ok, true);
		assert.equal(r.scope, "downloads");
		assert.equal(r.count, 1);
		assert.equal(r.items.length, 1);
		assert.ok(r.items[0].path.endsWith(path.join("Downloads", "old.txt")));
		assert.equal(r.items[0].bytes, 8);
		assert.ok(r.items[0].modifiedDaysAgo >= 39);
		assert.equal(r.totalBytes, 8);
		const badScope = await setPayload(ctx, { scope: "nope" }).macCleanPreview();
		assert.equal(badScope.error, "bad_scope");
	});

	// 8 — clean apply two-step
	await t("clean apply two-step: needs token, rejects bad token, moves to trash", async () => {
		const ctx = makeCtx();
		const dl = path.join(ctx.testHome, "Downloads");
		const oldTime = new Date(Date.now() - 40 * DAY_MS);
		const nowTime = new Date();
		fs.writeFileSync(path.join(dl, "junk.txt"), "junk-junk");
		fs.utimesSync(path.join(dl, "junk.txt"), nowTime, oldTime);
		fs.writeFileSync(path.join(dl, "keep.txt"), "keep");

		const step1 = await setPayload(ctx, { scope: "downloads", olderThanDays: 30 }).macCleanApply();
		assert.equal(step1.ok, false);
		assert.equal(step1.needsConfirmation, true);
		assert.ok(typeof step1.confirmToken === "string" && step1.confirmToken.length > 0);
		assert.equal(step1.summary.count, 1);

		const bad = await setPayload(ctx, { scope: "downloads", confirmToken: "bogus-token" }).macCleanApply();
		assert.equal(bad.ok, false);
		assert.equal(bad.error, "bad_or_expired_token");

		const good = await setPayload(ctx, { scope: "downloads", confirmToken: step1.confirmToken }).macCleanApply();
		assert.equal(good.ok, true);
		assert.equal(good.scope, "downloads");
		assert.equal(good.affected, 1);
		assert.equal(good.bytesReclaimed, 9);
		assert.ok(!fs.existsSync(path.join(dl, "junk.txt")), "file left Downloads");
		assert.ok(fs.existsSync(path.join(ctx.testHome, ".Trash", "junk.txt")), "file moved to .Trash");
		assert.ok(fs.existsSync(path.join(dl, "keep.txt")), "newer file untouched");

		// Token is single-use.
		const reuse = await setPayload(ctx, { scope: "downloads", confirmToken: step1.confirmToken }).macCleanApply();
		assert.equal(reuse.error, "bad_or_expired_token");
	});

	// 9 — trash apply empties contents only
	await t("trash apply empties contents but keeps .Trash dir", async () => {
		const ctx = makeCtx();
		fs.writeFileSync(path.join(ctx.testHome, ".Trash", "a.txt"), "a");
		fs.mkdirSync(path.join(ctx.testHome, ".Trash", "folder"), { recursive: true });
		fs.writeFileSync(path.join(ctx.testHome, ".Trash", "folder", "b.txt"), "b");
		const step1 = await setPayload(ctx, { scope: "trash" }).macCleanApply();
		assert.equal(step1.needsConfirmation, true);
		assert.equal(step1.summary.count, 2);
		const good = await setPayload(ctx, { scope: "trash", confirmToken: step1.confirmToken }).macCleanApply();
		assert.equal(good.ok, true);
		assert.equal(good.affected, 2);
		assert.ok(fs.existsSync(path.join(ctx.testHome, ".Trash")), ".Trash dir still exists");
		assert.deepEqual(fs.readdirSync(path.join(ctx.testHome, ".Trash")), []);
	});

	// 10 — screenshot rename plan format
	await t("screenshot rename plan format and collision-safe", async () => {
		const ctx = makeCtx();
		const desk = path.join(ctx.testHome, "Desktop");
		const shot = path.join(desk, "Screen Shot 2026-09-20 at 10.00.00 AM.png");
		fs.writeFileSync(shot, "png-bytes");
		const mtime = new Date(2026, 8, 20, 10, 5, 7, 0);
		fs.utimesSync(shot, new Date(), mtime);
		// Occupy the would-be target to force a collision suffix.
		fs.writeFileSync(path.join(desk, "screenshot-20260920-100507.png"), "taken");
		fs.writeFileSync(path.join(desk, "notes.txt"), "not a screenshot");
		const r = await setPayload(ctx, { scope: "screenshots" }).macCleanPreview();
		assert.equal(r.ok, true);
		assert.equal(r.plan.length, 1);
		assert.equal(r.plan[0].from, shot);
		assert.ok(/screenshot-20260920-100507-2\.png$/.test(r.plan[0].to), `unexpected to: ${r.plan[0].to}`);
		const applyToken = (await setPayload(ctx, { scope: "screenshots" }).macCleanApply()).confirmToken;
		const applied = await setPayload(ctx, { scope: "screenshots", confirmToken: applyToken }).macCleanApply();
		assert.equal(applied.ok, true);
		assert.equal(applied.affected, 1);
		assert.ok(fs.existsSync(r.plan[0].to), "renamed file exists");
		assert.ok(!fs.existsSync(shot), "original name gone");
	});

	// 11 — shortcuts arg building
	await t("macShortcut builds args correctly and caps stdout", async () => {
		let captured = null;
		const ctx = makeCtx({
			testExec: async (cmd, args, opts) => {
				captured = { cmd, args, opts };
				return { stdout: "x".repeat(25000), stderr: "", status: 0 };
			}
		});
		const r = await setPayload(ctx, { name: "My Shortcut" }).macShortcut();
		assert.equal(r.ok, true);
		assert.equal(r.name, "My Shortcut");
		assert.equal(captured.cmd, "shortcuts");
		assert.deepEqual(captured.args, ["run", "My Shortcut"]);
		assert.equal(captured.opts.timeout, 120000);
		assert.equal(r.stdout.length, 20000, "stdout capped at 20000 chars");
		const r2 = await setPayload(ctx, { name: "My Shortcut", input: "hello" }).macShortcut();
		assert.equal(r2.ok, true);
		assert.deepEqual(captured.args, ["run", "-i", "hello", "My Shortcut"]);
		const missing = await setPayload(ctx, {}).macShortcut();
		assert.equal(missing.error, "missing_name");
	});

	// 12 — shortcuts unavailable error
	await t("macShortcut reports shortcuts_unavailable when CLI missing", async () => {
		const enoent = Object.assign(new Error("spawn shortcuts ENOENT"), { code: "ENOENT" });
		const ctx = makeCtx({
			testExec: async () => {
				throw enoent;
			}
		});
		const r = await setPayload(ctx, { name: "Anything" }).macShortcut();
		assert.deepEqual(r, { ok: false, error: "shortcuts_unavailable" });
		const l = await setPayload(ctx, {}).macShortcutList();
		assert.deepEqual(l, { ok: false, error: "shortcuts_unavailable" });
	});

	// 13 — shortcut list parsing
	await t("macShortcutList parses non-empty lines", async () => {
		const ctx = makeCtx({
			testExec: async () => ({ stdout: "Alpha\nBeta\n\n  \nGamma\r\n", stderr: "", status: 0 })
		});
		const r = await setPayload(ctx, {}).macShortcutList();
		assert.equal(r.ok, true);
		assert.deepEqual(r.shortcuts, [{ name: "Alpha" }, { name: "Beta" }, { name: "Gamma" }]);
	});

	// 14 — test mode without testStateDir stays hermetic (never touches real state)
	await t("test mode without testStateDir stays hermetic", async () => {
		const bare = { config: {}, payload: {}, testMode: true, testHome: makeCtx().testHome };
		const actions = MacAuto.buildMacAutoActions(bare);
		const dir = MacAuto._stateDir(bare);
		assert.ok(dir.startsWith(os.tmpdir()), `fallback dir must be under tmp, got: ${dir}`);
		bare.payload = { name: "hermetic", command: "echo hermetic", when: { type: "hourly" } };
		const added = await actions.macScheduleAdd();
		assert.equal(added.ok, true);
		const list = await actions.macScheduleList();
		assert.equal(list.ok, true);
		assert.equal(list.schedules.length, 1);
		assert.equal(list.schedules[0].name, "hermetic");
		// The real private state dir must remain untouched.
		const RealStateDir = require("../tools/fs/actionGroups/mac/stateDir.js");
		const realDir = RealStateDir.ensure();
		assert.ok(!fs.existsSync(path.join(realDir, "schedules.json")), "real schedules.json must not exist");
		// The ticker fires hermetically too (fake job store, hermetic state).
		const calls = [];
		const tickCtx = {
			...bare,
			testNow: added.nextRunAt + 1000,
			testJobStore: {
				startCommandJob: async (cfg, p) => {
					calls.push(p);
					return { ok: true, jobId: "j1" };
				}
			}
		};
		await MacAuto._tick(tickCtx);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].command, "echo hermetic");
		const log = await actions.macScheduleLog();
		assert.ok(log.entries.some(e => e.status === "started" && e.jobId === "j1"));
	});

	// 15 — honors a testConfirmTokens fake
	await t("honors testConfirmTokens fake", async () => {
		const held = {};
		const ctx = makeCtx({
			testConfirmTokens: {
				create: payload => {
					held.bound = payload;
					return "tok-123";
				},
				consume: token => (token === "tok-123" ? held.bound : null)
			}
		});
		const dl = path.join(ctx.testHome, "Downloads");
		const oldTime = new Date(Date.now() - 40 * DAY_MS);
		fs.writeFileSync(path.join(dl, "z.txt"), "z-data");
		fs.utimesSync(path.join(dl, "z.txt"), new Date(), oldTime);
		const step1 = await setPayload(ctx, { scope: "downloads" }).macCleanApply();
		assert.equal(step1.needsConfirmation, true);
		assert.equal(step1.confirmToken, "tok-123");
		assert.equal(held.bound.scope, "downloads");
		const step2 = await setPayload(ctx, { scope: "downloads", confirmToken: "tok-123" }).macCleanApply();
		assert.equal(step2.ok, true);
		assert.equal(step2.affected, 1);
		assert.ok(fs.existsSync(path.join(ctx.testHome, ".Trash", "z.txt")));
	});

	const passed = results.filter(r => r.ok).length;
	const failed = results.filter(r => !r.ok).length;
	console.log(JSON.stringify({ passed, failed, results }, null, 2));
	if (failed > 0) process.exitCode = 1;
})().catch(error => {
	console.error(JSON.stringify({ fatal: error && error.stack ? error.stack : String(error) }));
	process.exitCode = 1;
});

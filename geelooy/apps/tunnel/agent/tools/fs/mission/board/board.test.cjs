// B"H — Mission OS end-to-end: all twelve capabilities, in Yaakov's order.
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const Board = require("./index.js");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mission-board-test-"));
const config = { deviceStateRoot: tmp };
const actor = "test-agent";
let passed = 0;
function check(name, cond) {
	assert(cond, `FAILED: ${name}`);
	passed++;
	console.log(`  ok - ${name}`);
}

(async () => {
	console.log("Mission OS end-to-end:");

	// --- base: per-project board ---
	const m1 = await Board.create(config, { actor, projectRoot: "ikar", title: "Translate Tanya ch1", goal: "Translate chapter 1.", tags: ["translation"] });
	check("board create", m1.missionId && m1.status === "open");
	const boardList = await Board.board(config, "ikar");
	check("per-project board list", boardList.length === 1);

	// (1) marketplace across projects
	await Board.create(config, { actor, projectRoot: "games", title: "Repair meadow", tags: ["repair"] });
	const market = await Board.marketplace(config, {});
	check("(1) marketplace spans projects", market.length === 2);
	const filtered = await Board.marketplace(config, { tags: ["translation"] });
	check("(1) marketplace filter", filtered.length === 1 && filtered[0].missionId === m1.missionId);

	// claim = self-assign; login resume via context
	const claimed = await Board.claim(config, { missionId: m1.missionId, actor, agentLabel: actor });
	check("claim/self-assign", claimed.mission.assignee === actor && claimed.mission.status === "claimed");
	await Board.setProgress(config, { missionId: m1.missionId, actor, percent: 40, summary: "Half the chapter done." });
	await Board.addNote(config, { missionId: m1.missionId, actor, text: "Tricky phrase in paragraph 3 — flagged." });
	const ctx = await Board.context(config, m1.missionId);
	check("login context bundle", ctx.resumeBrief.includes("40%") && ctx.recentNotes.length === 2 && ctx.progress.percent === 40);

	// permission scoping: a stranger cannot mutate
	let denied = null;
	try { await Board.setProgress(config, { missionId: m1.missionId, actor: "stranger", percent: 99 }); }
	catch (e) { denied = e.code; }
	check("permission scope enforced", denied === "not_assignee_or_creator");

	// assign + release by project
	const m2 = await Board.create(config, { actor: "project-owner", projectRoot: "ikar", title: "Proofread ch1" });
	await Board.assign(config, { missionId: m2.missionId, actor: "project-owner", agentLabel: "helper-agent" });
	check("assign", (await Board.get(config, m2.missionId)).assignee === "helper-agent");
	await Board.release(config, { missionId: m2.missionId, actor: "project-owner" });
	const released = await Board.get(config, m2.missionId);
	check("release", released.assignee === null && released.status === "open");

	// (2) handoff capsules
	const cap = await Board.capsuleCreate(config, { missionId: m1.missionId, actor, label: "end of shift" });
	check("(2) capsule created", cap.capsuleId && cap.snapshot.missionId === m1.missionId);
	const loaded = await Board.capsuleLoad(config, cap.capsuleId);
	check("(2) capsule loads full context", loaded.resumeBrief.includes("Translate Tanya ch1") && loaded.snapshot.progress.percent === 40);

	// (3) templates
	const templates = await Board.templateList(config);
	check("(3) templates listed", templates.some(t => t.templateId === "translate-sefer") && templates.some(t => t.templateId === "repair-game") && templates.some(t => t.templateId === "audit-corpus"));
	const tm = await Board.templateInstantiate(config, "translate-sefer", { workTitle: "Likutei Amarim", sourceRef: "ch2", targetLanguage: "English" });
	const m3 = await Board.create(config, { actor, projectRoot: "ikar", title: tm.title, goal: tm.goal, tags: tm.tags, templateId: tm.templateId });
	check("(3) template instantiated", m3.title.includes("Likutei Amarim") && m3.templateId === "translate-sefer");

	// (4) swarm
	const swarmParent = await Board.create(config, { actor, projectRoot: "ikar", title: "Translate 3 chapters" });
	const { children } = await Board.swarmSplit(config, { missionId: swarmParent.missionId, actor, shards: [{ title: "ch1" }, { title: "ch2" }, { title: "ch3" }] });
	check("(4) swarm split", children.length === 3 && children.every(c => c.swarm.parentId === swarmParent.missionId));
	for (let i = 0; i < children.length; i++) {
		const label = `shard-agent-${i}`;
		await Board.claim(config, { missionId: children[i].missionId, actor: label, agentLabel: label });
		await Board.complete(config, { missionId: children[i].missionId, actor: label, summary: "done", force: true });
	}
	const merged = await Board.swarmMerge(config, { missionId: swarmParent.missionId, actor });
	check("(4) swarm merged", merged.digest.includes("ch1") && merged.children.every(c => c.status === "complete"));

	// (5) scheduled missions
	const sched = await Board.scheduleCreate(config, { actor, name: "Daily audit", templateId: "audit-corpus", params: { corpusName: "tanach", defectKind: "typos" }, every: "1d", projectRoot: "ikar" });
	check("(5) schedule created", sched.scheduleId && sched.active);
	const fired = await Board.scheduleTick(config, { force: true });
	check("(5) schedule tick fires", fired.length === 1 && fired[0].mission.tags.includes("scheduled"));

	// (6) dashboard
	const snap = await Board.dashboardSnapshot(config);
	check("(6) dashboard snapshot", snap.total >= 8 && snap.byProject.ikar.total >= 6);
	const html = await Board.dashboardPage(config);
	check("(6) dashboard page renders", html.includes("Awtsmoos Mission Board") && html.includes("var(--bg)"));

	// (7) checkpoint and resume
	const m4 = await Board.create(config, { actor, projectRoot: "ikar", title: "Long translation" });
	await Board.claim(config, { missionId: m4.missionId, actor });
	await Board.setProgress(config, { missionId: m4.missionId, actor, percent: 63, summary: "Deep in chapter 5." });
	const paused = await Board.pause(config, { missionId: m4.missionId, actor });
	check("(7) pause snapshots capsule", paused.mission.status === "paused" && !!paused.capsule);
	const resumed = await Board.resume(config, { missionId: m4.missionId, actor });
	check("(7) resume zero context loss", resumed.mission.status === "active" && resumed.capsule.snapshot.progress.percent === 63);

	// (8) chaining
	const m5 = await Board.create(config, { actor, projectRoot: "ikar", title: "Translate intro" });
	await Board.claim(config, { missionId: m5.missionId, actor });
	await Board.chainAdd(config, { missionId: m5.missionId, actor, followups: [{ title: "Translate chapter 1", goal: "Next." }] });
	const done5 = await Board.complete(config, { missionId: m5.missionId, actor, summary: "Intro done.", force: true });
	check("(8) completion spawns follow-up", done5.spawned.length === 1 && done5.spawned[0].spawnedFrom === m5.missionId);

	// (9) agent-to-agent messaging
	await Board.messageSend(config, { missionId: m1.missionId, actor, to: "helper-agent", text: "Can you proofread paragraph 3?" });
	await Board.messageSend(config, { missionId: m1.missionId, from: "helper-agent", text: "On it." });
	const inbox = await Board.messageInbox(config, { missionId: m1.missionId, for: "helper-agent" });
	check("(9) messaging + inbox", inbox.length === 2 && inbox[0].to === "helper-agent");

	// (10) failure autopsy
	const m6 = await Board.create(config, { actor, projectRoot: "ikar", title: "Doomed task", tags: ["translation"] });
	await Board.claim(config, { missionId: m6.missionId, actor });
	const failed = await Board.fail(config, { missionId: m6.missionId, actor, whatWentWrong: "Source file vanished mid-run.", cause: "Assumed the path was stable.", lesson: "Re-resolve source paths before every chunk." });
	check("(10) autopsy recorded", failed.mission.status === "failed" && failed.autopsy.lesson.includes("Re-resolve"));
	const lessons = await Board.autopsyLessons(config, { query: "source paths" });
	check("(10) lessons searchable", lessons.length === 1);
	const m7 = await Board.create(config, { actor, projectRoot: "ikar", title: "Another translation", tags: ["translation"] });
	check("(10) new missions inherit lessons", (m7.priorLessons || []).length >= 1);

	// (11) voice-to-mission
	const vm = await Board.voiceDictate(config, { actor: "yaakov-voice", transcript: "Translate the new Kuntres\nStart with chapter one, verify every chunk." });
	check("(11) voice becomes mission", vm.title.includes("Kuntres") && vm.tags.includes("voice") && vm.voiceTranscript.length > 20);

	// (12) cross-tunnel federation
	const env = await Board.federationExport(config, { missionId: m1.missionId, actor });
	check("(12) envelope signed", !!env.signature && !!env.body);
	const config2 = { deviceStateRoot: fs.mkdtempSync(path.join(os.tmpdir(), "mission-board-remote-")) };
	const imported = await Board.federationImport(config2, { envelope: env, actor: "remote-agent" });
	check("(12) envelope imports (unverified on foreign key)", imported.mission.missionId === m1.missionId && imported.trusted === false);
	const imported2 = await Board.federationImport(config, { envelope: env, actor });
	check("(12) same-key envelope verifies", imported2.trusted === true);

	// checkpoints lifecycle
	const m1cp = await Board.addCheckpoint(config, { missionId: m1.missionId, actor, plainEnglish: "Finish chapter." });
	const cpId = m1cp.checkpoints[m1cp.checkpoints.length - 1].checkpointId;
	await Board.completeCheckpoint(config, { missionId: m1.missionId, actor, checkpointId: cpId });
	const m1b = await Board.get(config, m1.missionId);
	check("checkpoint lifecycle", m1b.checkpoints.some(c => c.checkpointId === cpId && c.status === "complete"));

	console.log(`\nAll ${passed} checks passed.`);
})().catch(e => { console.error("TEST FAILURE:", e.code || "", e.message); process.exit(1); });

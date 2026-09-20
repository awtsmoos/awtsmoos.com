//B"H
// WorkOS core test suite (node). Loads the plain-script core files via vm
// (browser-style <script> order) and exercises the contract.
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const FILES = ["util.js", "events.js", "entities.js", "graph.js", "work.js",
  "rooms.js", "provenance.js", "capsule.js", "seed.js", "store.js"];

const ctx = vm.createContext({ console });
for (const f of FILES) {
  vm.runInContext(fs.readFileSync(path.join(here, f), "utf8"), ctx, { filename: f });
}
const WorkOS = ctx.WorkOS;

let pass = 0, fail = 0;
// vm-realm values have different prototypes; normalize before deepStrictEqual
const norm = (v) => (v !== null && typeof v === "object") ? JSON.parse(JSON.stringify(v)) : v;
function t(name, fn) {
  try { fn(); pass++; console.log("ok   " + name); }
  catch (e) { fail++; console.log("FAIL " + name + " :: " + (e && e.message)); }
}

// ---------- basics ----------
t("version is 0.1.0", () => {
  assert.strictEqual(WorkOS.version, "0.1.0");
  assert.ok(WorkOS.WorkOSCore === undefined, "no leak");
});

t("reset clears state and persists empty", () => {
  WorkOS.events.append({ type: "fact.test_passed", data: {} });
  WorkOS.reset();
  assert.strictEqual(WorkOS.events.list().length, 0);
  assert.strictEqual(WorkOS.entities.find("mission").length, 0);
});

// ---------- events ----------
t("event append/query filters (type, prefix, mission, actorId, since, limit, newest-first)", () => {
  WorkOS.reset();
  const m = WorkOS.missions.create({ title: "M1", objective: "o" });
  const e1 = WorkOS.events.append({ type: "fact.test_passed", actor: { kind: "agent", id: "a1", name: "A1" }, mission: m.id, data: { n: 1 } });
  const e2 = WorkOS.events.append({ type: "fact.test_failed", actor: { kind: "agent", id: "a2" }, mission: m.id, data: { n: 2 } });
  assert.ok(e1.seq < e2.seq, "seq increments");
  assert.ok(e1.id.startsWith("evt_"));
  assert.deepStrictEqual(norm(e1.causes), []);
  // newest-first
  const all = WorkOS.events.list();
  assert.strictEqual(all[0].id, e2.id);
  // type filter
  assert.strictEqual(WorkOS.events.list({ type: "fact.test_passed" }).length, 1);
  // typePrefix
  assert.strictEqual(WorkOS.events.list({ typePrefix: "fact." }).length, 2);
  assert.strictEqual(WorkOS.events.list({ typePrefix: "decision." }).length, 0);
  // mission + actorId
  assert.strictEqual(WorkOS.events.list({ mission: m.id }).length, 3); // + mission.created
  assert.strictEqual(WorkOS.events.list({ actorId: "a1" }).length, 1);
  // since
  assert.strictEqual(WorkOS.events.list({ since: e2.ts + 1 }).length, 0);
  assert.ok(WorkOS.events.list({ since: e1.ts }).length >= 2);
  // limit
  assert.strictEqual(WorkOS.events.list({ limit: 1 }).length, 1);
  // envelope shape
  for (const k of ["id", "seq", "ts", "type", "actor", "entity", "mission", "work", "room", "causes", "data"])
    assert.ok(k in e1, "envelope has " + k);
});

// ---------- entities ----------
t("entity identity stable across rename; pathAliases; file.renamed emitted", () => {
  WorkOS.reset();
  const f = WorkOS.entities.register("file", { name: "a.js", attrs: { path: "a.js" } });
  assert.ok(f.id.startsWith("awts://entity/file/"));
  assert.deepStrictEqual(norm(f.attrs), { path: "a.js" });
  assert.deepStrictEqual(norm(f.pathAliases), []);
  const r1 = WorkOS.entities.rename(f.id, "b.js", "b.js");
  const r2 = WorkOS.entities.rename(r1.id, "c.js");
  assert.strictEqual(r2.id, f.id, "id stable across renames");
  assert.strictEqual(r2.name, "c.js");
  assert.ok(r2.pathAliases.includes("a.js"), "old name kept, got " + JSON.stringify(r2.pathAliases));
  assert.ok(r2.pathAliases.includes("b.js"), "intermediate name kept");
  const renames = WorkOS.events.list({ type: "file.renamed" });
  assert.strictEqual(renames.length, 2);
  assert.strictEqual(renames[0].data.newName, "c.js");
  // find: case-insensitive substring, sorted by name
  WorkOS.entities.register("file", { name: "Zebra.js" });
  WorkOS.entities.register("file", { name: "apple.js" });
  const found = WorkOS.entities.find("file", "JS");
  assert.deepStrictEqual(norm(found.map((e) => e.name)), ["apple.js", "c.js", "Zebra.js"]);
  assert.strictEqual(WorkOS.entities.get("nope"), null);
});

t("agent registration emits agent.registered", () => {
  WorkOS.reset();
  const a = WorkOS.entities.register("agent", { name: "Sela", attrs: { role: "builder" } });
  const evs = WorkOS.events.list({ type: "agent.registered" });
  assert.strictEqual(evs.length, 1);
  assert.strictEqual(evs[0].entity, a.id);
  assert.strictEqual(evs[0].data.role, "builder");
});

// ---------- work lifecycle ----------
t("work create->doing->blocked->done emits the right events", () => {
  WorkOS.reset();
  const m = WorkOS.missions.create({ title: "M", objective: "o", acceptance: "a" });
  const w = WorkOS.work.create({ missionId: m.id, title: "Do thing", acceptance: "done-ness" });
  assert.strictEqual(w.attrs.status, "todo");
  assert.strictEqual(w.attrs.owner, null);
  assert.deepStrictEqual(norm(w.attrs.links), []);
  assert.ok(WorkOS.events.list({ type: "work.created" }).some((e) => e.work === w.id));

  WorkOS.work.setStatus(w.id, "doing", { note: "starting" });
  WorkOS.work.setStatus(w.id, "blocked", { note: "stuck on x" });
  WorkOS.work.setStatus(w.id, "doing", { note: "unstuck" });
  WorkOS.work.setStatus(w.id, "done", { note: "shipped", evidence: "test run" });

  const sc = WorkOS.events.list({ type: "work.status_changed" });
  assert.strictEqual(sc.length, 4);
  assert.deepStrictEqual(norm(sc.map((e) => e.data.to)), ["done", "doing", "blocked", "doing"]); // newest-first
  assert.strictEqual(sc[3].data.from, "todo");
  assert.strictEqual(sc[0].data.note, "shipped");
  assert.strictEqual(sc[0].data.evidence, "test run");
  assert.strictEqual(WorkOS.events.list({ type: "work.blocked" }).length, 1);
  assert.strictEqual(WorkOS.events.list({ type: "work.unblocked" }).length, 1);
  const done = WorkOS.events.list({ type: "work.completed" });
  assert.strictEqual(done.length, 1);
  assert.strictEqual(done[0].data.evidence, "test run");
  assert.strictEqual(WorkOS.work.get(w.id).attrs.status, "done");
  assert.throws(() => WorkOS.work.setStatus(w.id, "bogus"), /invalid status/);
});

t("work.link validates rel, stores link, emits work.linked", () => {
  WorkOS.reset();
  const a = WorkOS.work.create({ title: "A" });
  const b = WorkOS.work.create({ title: "B" });
  WorkOS.work.link(a.id, b.id, "blocks");
  const got = WorkOS.work.get(a.id);
  assert.strictEqual(got.attrs.links.length, 1);
  assert.strictEqual(got.attrs.links[0].rel, "blocks");
  assert.strictEqual(got.attrs.links[0].other, b.id);
  assert.strictEqual(WorkOS.events.list({ type: "work.linked" }).length, 1);
  assert.throws(() => WorkOS.work.link(a.id, b.id, "eats"), /invalid rel/);
  // work.list filters
  const m = WorkOS.missions.create({ title: "MM", objective: "o" });
  const w2 = WorkOS.work.create({ missionId: m.id, title: "C", owner: "ag1" });
  assert.strictEqual(WorkOS.work.list({ missionId: m.id }).length, 1);
  assert.strictEqual(WorkOS.work.list({ status: "todo" }).length, 3);
  assert.strictEqual(WorkOS.work.list({ owner: "ag1" }).length, 1);
  assert.strictEqual(w2.attrs.owner, "ag1");
});

// ---------- rooms ----------
t("room post/history ordering + all msgKinds + validation", () => {
  WorkOS.reset();
  const r = WorkOS.rooms.create({ name: "r1" });
  assert.ok(WorkOS.events.list({ type: "room.created" }).some((e) => e.room === r.id));
  const kinds = WorkOS.rooms.MSGKINDS;
  assert.strictEqual(kinds.length, 10);
  kinds.forEach((k, i) => WorkOS.rooms.post(r.id, { author: { kind: "agent", id: "a" + i, name: "A" + i }, msgKind: k, body: "body-" + k }));
  const h = WorkOS.rooms.history(r.id);
  assert.strictEqual(h.length, 10);
  assert.strictEqual(h[0].data.body, "body-" + kinds[0], "oldest first");
  assert.strictEqual(h[9].data.body, "body-" + kinds[9], "newest last");
  assert.deepStrictEqual(norm(h.map((e) => e.data.msgKind)), norm(kinds));
  const limited = WorkOS.rooms.history(r.id, { limit: 3 });
  assert.strictEqual(limited.length, 3);
  assert.strictEqual(limited[0].data.msgKind, kinds[7]);
  assert.throws(() => WorkOS.rooms.post(r.id, { author: "x", msgKind: "nope", body: "b" }), /invalid msgKind/);
  // author as entity id string resolves name
  const ag = WorkOS.entities.register("agent", { name: "Sela" });
  const ev = WorkOS.rooms.post(r.id, { author: ag.id, msgKind: "message", body: "hi" });
  assert.strictEqual(ev.actor.name, "Sela");
  assert.strictEqual(ev.data.to, null);
});

t("presence latest-wins", () => {
  WorkOS.reset();
  const r = WorkOS.rooms.create({ name: "r" });
  WorkOS.rooms.setPresence(r.id, "a1", "online");
  WorkOS.rooms.setPresence(r.id, "a2", "away");
  WorkOS.rooms.setPresence(r.id, "a1", "offline");
  const p = WorkOS.rooms.presence(r.id);
  assert.strictEqual(p.length, 2);
  const m1 = p.find((x) => x.agentId === "a1");
  assert.strictEqual(m1.status, "offline", "latest wins");
  assert.ok(m1.ts);
  assert.throws(() => WorkOS.rooms.setPresence(r.id, "a1", "sleeping"), /invalid status/);
});

// ---------- provenance ----------
t("provenance.record appends to entity history and emits event", () => {
  WorkOS.reset();
  const f = WorkOS.entities.register("file", { name: "x.js", attrs: { path: "x.js" } });
  const ev = WorkOS.provenance.record({
    tool: "tunnel-fs.write", agentId: "a9", entityId: f.id,
    summary: "patched", intent: "fix", beforeHash: "b1", afterHash: "b2", outcome: "ok"
  });
  assert.strictEqual(ev.type, "provenance.recorded");
  assert.strictEqual(ev.data.tool, "tunnel-fs.write");
  const got = WorkOS.entities.get(f.id);
  assert.strictEqual(got.attrs.history.length, 1);
  assert.deepStrictEqual(
    (({ ts, ...rest }) => rest)(got.attrs.history[0]),
    { tool: "tunnel-fs.write", summary: "patched", outcome: "ok", beforeHash: "b1", afterHash: "b2" });
  // unknown entityId: event still recorded, no crash
  const ev2 = WorkOS.provenance.record({ tool: "t", entityId: "awts://entity/file/nope", summary: "s" });
  assert.strictEqual(ev2.type, "provenance.recorded");
});

// ---------- capsule ----------
t("capsule budget enforcement: mandatory kept, total within budget", () => {
  WorkOS.reset();
  WorkOS.seed();
  const m = WorkOS.missions.list()[0];
  const full = WorkOS.capsule.compile({ missionId: m.id });
  assert.strictEqual(full.layers[0].name, "laws");
  assert.deepStrictEqual(norm(full.layers.map((l) => l.name)),
    ["laws", "objective", "canonical_decisions", "active_work", "blockers", "peer_obligations", "recent_discoveries", "known_failures"]);
  assert.ok(full.text.includes("## laws"));
  assert.ok(full.layers.every((l) => l.tokens === Math.ceil(l.text.length / 4)));
  // tight budget: lowest-priority layers dropped, mandatory kept
  const tight = WorkOS.capsule.compile({ missionId: m.id, budgetTokens: 200 });
  assert.strictEqual(tight.layers[0].name, "laws");
  assert.ok(tight.layers.length < full.layers.length, "layers were dropped");
  assert.ok(tight.totalTokens <= 200, "within budget, got " + tight.totalTokens);
  assert.ok(tight.text.includes("Dropped"));
  // tiny budget below mandatory: laws kept anyway + note
  const tiny = WorkOS.capsule.compile({ missionId: m.id, budgetTokens: 10 });
  assert.strictEqual(tiny.layers[0].name, "laws");
  assert.ok(tiny.text.includes("mandatory"), "mandatory-over-budget note present");
  // default budget
  const dflt = WorkOS.capsule.compile({});
  assert.ok(dflt.layers.length === 8);
});

// ---------- graph ----------
t("graph.related returns nodes/edges from links, causes, work->mission", () => {
  WorkOS.reset();
  const m = WorkOS.missions.create({ title: "GM", objective: "o" });
  const a = WorkOS.work.create({ missionId: m.id, title: "GA" });
  const b = WorkOS.work.create({ missionId: m.id, title: "GB" });
  WorkOS.work.link(a.id, b.id, "blocks");
  const g = WorkOS.graph.related(a.id);
  assert.ok(g.nodes.some((n) => n.id === a.id));
  assert.ok(g.nodes.some((n) => n.id === b.id), "link target included");
  assert.ok(g.nodes.some((n) => n.id === m.id), "mission included via part_of");
  assert.ok(g.edges.some((e) => e.from === a.id && e.to === b.id && e.rel === "blocks"));
  assert.ok(g.edges.some((e) => e.from === a.id && e.to === m.id && e.rel === "part_of"));
  // causes chain
  const cause = WorkOS.events.append({ type: "fact.test_failed", work: b.id, data: {} });
  WorkOS.events.append({ type: "work.blocked", work: a.id, causes: [cause.id], data: {} });
  const g2 = WorkOS.graph.related(a.id);
  assert.ok(g2.edges.some((e) => e.rel === "caused_by" && e.to === b.id), "causes edge present");
  assert.deepStrictEqual(norm(WorkOS.graph.related("awts://entity/work/nope")), { nodes: [], edges: [] });
});

// ---------- decisions / facts / claims ----------
t("decisions.list status = latest decision.* per title", () => {
  WorkOS.reset();
  const m = WorkOS.missions.create({ title: "DM", objective: "o" });
  WorkOS.events.append({ type: "decision.proposed", mission: m.id, data: { title: "T1", rationale: "r" } });
  WorkOS.events.append({ type: "decision.accepted", mission: m.id, data: { title: "T1", rationale: "r2" } });
  WorkOS.events.append({ type: "decision.proposed", mission: m.id, data: { title: "T2" } });
  WorkOS.events.append({ type: "decision.superseded", mission: m.id, data: { title: "T2", supersedes: "T1" } });
  const all = WorkOS.decisions.list({ mission: m.id });
  assert.strictEqual(all.length, 2);
  assert.strictEqual(all.find((d) => d.title === "T1").status, "accepted");
  assert.strictEqual(all.find((d) => d.title === "T2").status, "superseded");
  assert.strictEqual(all.find((d) => d.title === "T2").supersedes, "T1");
  assert.strictEqual(WorkOS.decisions.list({ mission: m.id, status: "accepted" }).length, 1);
});

t("facts.list / claims.list filter over events", () => {
  WorkOS.reset();
  WorkOS.events.append({ type: "fact.test_passed", data: { a: 1 } });
  WorkOS.events.append({ type: "claim.made", data: { text: "c", confidence: 0.5 } });
  assert.strictEqual(WorkOS.facts.list().length, 1);
  assert.strictEqual(WorkOS.claims.list().length, 1);
  assert.strictEqual(WorkOS.facts.list({ limit: 5 }).length, 1);
});

// ---------- missions.overview ----------
t("missions.overview shape", () => {
  WorkOS.reset();
  WorkOS.seed();
  const m = WorkOS.missions.list()[0];
  const ov = WorkOS.missions.overview(m.id);
  assert.strictEqual(ov.mission.id, m.id);
  assert.deepStrictEqual(Object.keys(ov.progress).sort(), ["done", "pct", "total"]);
  assert.strictEqual(ov.progress.total, 6);
  assert.strictEqual(ov.progress.done, 2);
  assert.strictEqual(ov.blockers.length, 1);
  assert.strictEqual(ov.agents.length, 3);
  assert.ok(ov.agents.every((a) => a.agent && "status" in a && "currentWork" in a));
  assert.strictEqual(ov.recentActivity.length, 8);
  assert.ok(ov.decisions.length >= 3);
  assert.ok(ov.openRequests.length >= 1);
  assert.ok(ov.openRequests.every((e) => e.data.msgKind === "request"));
});

// ---------- seed ----------
t("seed is idempotent and builds the full demo world", () => {
  WorkOS.reset();
  const r1 = WorkOS.seed();
  assert.strictEqual(r1.seeded, true);
  const evCount1 = WorkOS.events.list().length;
  const entCount1 = Object.keys(ctx.WorkOSCore.state.entities).length;
  const r2 = WorkOS.seed();
  assert.strictEqual(r2.seeded, false);
  assert.strictEqual(WorkOS.events.list().length, evCount1, "no new events on reseed");
  assert.strictEqual(Object.keys(ctx.WorkOSCore.state.entities).length, entCount1, "no new entities on reseed");

  const m = WorkOS.missions.list()[0];
  assert.strictEqual(m.name, "Tunnel Hardening — v0.1");
  assert.strictEqual(m.attrs.acceptance, "p99 action latency under 3s during flaps");

  const works = WorkOS.work.list({ missionId: m.id });
  assert.strictEqual(works.length, 6);
  const byStatus = {};
  works.forEach((w) => { byStatus[w.attrs.status] = (byStatus[w.attrs.status] || 0) + 1; });
  assert.deepStrictEqual(byStatus, { done: 2, doing: 2, todo: 1, blocked: 1 });

  const blocked = works.find((w) => w.attrs.status === "blocked");
  const doing = works.filter((w) => w.attrs.status === "doing");
  const blockerLink = doing.some((d) => (d.attrs.links || []).some((l) => l.rel === "blocks" && l.other === blocked.id));
  assert.ok(blockerLink, "blocked item is blocked BY a doing item via blocks link");

  const agents = WorkOS.entities.find("agent");
  assert.strictEqual(agents.length, 3);
  assert.deepStrictEqual(norm(agents.map((a) => a.name)), ["Mevakir", "Poretz", "Sela"]);
  assert.ok(WorkOS.entities.find("human", "yaakov").length === 1);

  const rooms = WorkOS.entities.find("room");
  assert.strictEqual(rooms.length, 1);
  const hist = WorkOS.rooms.history(rooms[0].id);
  assert.ok(hist.length >= 12, "room has >=12 posts, got " + hist.length);
  const kinds = new Set(hist.map((e) => e.data.msgKind));
  assert.ok(kinds.size >= 8, ">=8 distinct msgKinds, got " + kinds.size);

  const pres = WorkOS.rooms.presence(rooms[0].id);
  assert.strictEqual(pres.length, 3);

  const decs = WorkOS.decisions.list({ mission: m.id });
  assert.strictEqual(decs.find((d) => d.title === "Reconnect backoff resets on registration").status, "accepted");
  const sup = decs.find((d) => d.title === "Single shared socket for all agents");
  assert.strictEqual(sup.status, "superseded");
  assert.strictEqual(sup.supersedes, "Per-channel isolation");

  assert.strictEqual(WorkOS.facts.list({ mission: m.id }).filter((f) => f.type === "fact.test_passed").length, 2);
  assert.strictEqual(WorkOS.facts.list({ mission: m.id }).filter((f) => f.type === "fact.command_exited").length, 1);
  assert.strictEqual(WorkOS.claims.list({ mission: m.id }).length, 1);

  const files = WorkOS.entities.find("file");
  assert.strictEqual(files.length, 2);
  assert.ok(files.every((f) => (f.attrs.history || []).length >= 1), "each file has history entries");
  assert.strictEqual(WorkOS.events.list({ type: "provenance.recorded" }).length, 2);
});

// ---------- persistence ----------
t("persistence: _save/_load round-trips state", () => {
  WorkOS.reset();
  WorkOS.events.append({ type: "fact.test_passed", data: { x: 1 } });
  WorkOS.entities.register("agent", { name: "Persisty" });
  WorkOS._save();
  // simulate a fresh boot: wipe live state, reload
  ctx.WorkOSCore.state.events = [];
  ctx.WorkOSCore.state.entities = {};
  WorkOS._load();
  assert.strictEqual(WorkOS.events.list().length, 2); // fact + agent.registered
  assert.strictEqual(WorkOS.entities.find("agent", "persisty").length, 1);
});

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);

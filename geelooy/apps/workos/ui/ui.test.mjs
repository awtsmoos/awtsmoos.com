//B"H
// WorkOS UI tests — run with: node ui/ui.test.mjs
// Loads the stub core + pure view functions in a vm (no DOM) and asserts on HTML strings.

import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const ctx = vm.createContext({ console });
for (const f of ["stub.workos.js", "components.js", "views/home.js", "views/mission.js"]) {
  vm.runInContext(readFileSync(path.join(dir, f), "utf8"), ctx, { filename: f });
}

const W = ctx.WorkOS;
const homeHtml = () => ctx.renderHome(W);
const missionHtml = (tab) => ctx.renderMission(W, "m_tunnel", tab);

test("stub exposes the WorkOS contract", () => {
  for (const k of ["missions", "work", "rooms", "entities", "decisions", "facts", "claims", "events", "seed", "version"]) {
    assert.ok(W[k], "missing WorkOS." + k);
  }
  assert.equal(W.missions.list().length, 1);
});

test("home: mission title + agent names render", () => {
  const h = homeHtml();
  assert.ok(h.includes("Tunnel Hardening — v0.1"), "mission title missing");
  for (const n of ["Noam Levi", "Talia Ben-David", "Ari Goldstein"]) {
    assert.ok(h.includes(n), "agent missing: " + n);
  }
});

test("home: has search input and soon cards", () => {
  const h = homeHtml();
  assert.ok(h.includes('id="home-search"'), "search input missing");
  assert.ok(h.includes("soon"), "soon cards missing");
});

test("mission overview: objective + progress pct", () => {
  const h = missionHtml("overview");
  assert.ok(h.includes("websocket flapping"), "objective missing");
  assert.ok(h.includes("33%"), "expected 33% progress (2 of 6 done)");
  assert.ok(h.includes("Next important action"), "next action missing");
  assert.ok(h.includes("Blockers"), "blockers panel missing");
});

test("mission: unknown id and unknown tab handled", () => {
  assert.ok(ctx.renderMission(W, "nope").includes("not found"));
  assert.ok(ctx.renderMission(W, "m_tunnel", "bogus").includes("Objective"));
});

test("room tab: >=6 distinct msgKind badges + composer", () => {
  const h = missionHtml("room");
  const kinds = new Set([...h.matchAll(/class="badge mk-([a-z_]+)"/g)].map((m) => m[1]));
  assert.ok(kinds.size >= 6, "only " + kinds.size + " msgKind badges: " + [...kinds].join(","));
  for (const k of ["announcement", "request", "blocker", "handoff", "review_request"]) {
    assert.ok(kinds.has(k), "missing kind badge: " + k);
  }
  assert.ok(h.includes('data-action="room-post"'), "composer post button missing");
  assert.ok(h.includes("In this room"), "presence sidebar missing");
});

test("work tab: filter chips for all statuses + status pills on cards", () => {
  const h = missionHtml("work");
  for (const s of ["todo", "doing", "blocked", "review", "done"]) {
    assert.ok(h.includes('data-work-filter="' + s + '"'), "missing chip: " + s);
    assert.ok(h.includes('data-status="' + s + '"'), "missing card with status: " + s);
  }
  assert.ok(h.includes('data-action="work-status"'), "set-status buttons missing");
});

test("agents tab: roster with specialties", () => {
  const h = missionHtml("agents");
  assert.ok(h.includes("tunnel networking"), "specialty missing");
  assert.ok(h.includes("regression testing"), "specialty missing");
});

test("decisions tab: accepted + superseded + supersedes chain", () => {
  const h = missionHtml("decisions");
  assert.ok(h.includes("Accepted"), "accepted pill missing");
  assert.ok(h.includes("Superseded"), "superseded pill missing");
  assert.ok(h.includes("Proposed"), "proposed pill missing");
  assert.ok(h.includes("Supersedes:"), "supersedes chain note missing");
});

test("files tab: file history timeline entries", () => {
  const h = missionHtml("files");
  assert.ok(h.includes("transportFailure.js"), "file name missing");
  assert.ok(h.includes("file.modified"), "file.modified history missing");
  assert.ok(h.includes("provenance.recorded"), "provenance.recorded history missing");
});

test("activity tab: newest-first event feed", () => {
  const h = missionHtml("activity");
  assert.ok(h.includes("work.status"), "event rows missing");
  const first = h.indexOf("ev-row");
  assert.ok(first >= 0);
});

test("components: esc() neutralizes script injection", () => {
  const out = ctx.esc('<script>alert("x")</script>');
  assert.ok(!out.includes("<script>"), "raw script tag survived");
  assert.ok(out.includes("&lt;script&gt;"), "escaped script missing");
  assert.equal(ctx.esc(null), "");
  assert.equal(ctx.esc(undefined), "");
});

test("components: progressBar / statusPill / msgKindBadge shapes", () => {
  assert.ok(ctx.progressBar(40).includes("40%"));
  assert.ok(ctx.progressBar(150).includes("100%"));
  assert.ok(ctx.statusPill("blocked").includes("Blocked"));
  assert.ok(ctx.msgKindBadge("review_request").includes("review request"));
  assert.ok(ctx.avatar("Noam Levi").includes("NL"));
});

test("views escape untrusted data (XSS via stub injection)", () => {
  const evil = '<img src=x onerror=alert(1)>';
  const h = ctx.renderHome({
    ...W,
    missions: { list: () => [{ id: "mx", kind: "mission", name: evil, createdTs: Date.now(), attrs: {} }],
                overview: () => ({ progress: { total: 0, done: 0, pct: 0 } }) },
    entities: { find: () => [], get: () => null },
    events: { list: () => [] },
    work: { list: () => [] },
  });
  assert.ok(!h.includes("<img src=x"), "unescaped HTML in mission name");
  assert.ok(h.includes("&lt;img"), "escaped payload missing");
});

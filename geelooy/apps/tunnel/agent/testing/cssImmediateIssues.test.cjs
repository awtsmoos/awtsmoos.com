// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file cssImmediateIssues.test.cjs — fixture-driven PURE tests for the
 * cssImmediateIssues aggregate action (Worker F).
 *
 * No live browser: every input is shaped like the Worker A forensics
 * contract (traceCascade / scanConflicts outputs). Proves the aggregate
 * catches at minimum (a) a specificity war, (b) a dead @import, (c) a
 * hidden-overflow trap, plus ranking and fail-closed behavior.
 */

const test = require("node:test");
const assert = require("node:assert/strict");

const mod = require("../tools/chrome/cssImmediateIssues.js");

/**
 * Builds a winning-declaration fixture shaped like the forensics contract.
 */
function decl(property, value, selector, specificity, sourceUrl, lineNumber, extra = {}) {
  return {
    property,
    value,
    selector,
    specificity,
    sourceUrl,
    lineNumber,
    mediaQueries: [],
    origin: "author",
    important: false,
    ...extra
  };
}

/**
 * Builds a traceCascade-result fixture shaped like the forensics contract.
 */
function trace(selector, opts = {}) {
  return {
    selector,
    boundingBox: { x: 0, y: 0, width: 100, height: 100 },
    geometry: { scrollWidth: 100, clientWidth: 100, scrollHeight: 100, clientHeight: 100 },
    computed: { display: "block", position: "static", overflow: "visible", backgroundImage: "none" },
    winningDeclarations: [],
    cssVariables: {},
    scrollOwner: null,
    viewportOwners: [],
    hasText: false,
    clippedByFixed: false,
    ...opts
  };
}

test("module loads with defensive require; availability reflects reality", () => {
  assert.equal(typeof mod.cssImmediateIssues, "function");
  assert.equal(typeof mod.aggregateIssues, "function");
  // Worker A may or may not have landed cssForensics.js yet — the module must
  // load either way and report availability truthfully.
  assert.equal(typeof mod.forensicsAvailable(), "boolean");
});

test("(a) catches a specificity war from scanConflicts findings", () => {
  const out = mod.aggregateIssues({
    conflicts: [{
      severity: "HIGH",
      kind: "specificity-war",
      selector: "#app .nav",
      detail: ".a .nav [0,2,0] and .b .nav [0,2,0] both set display — order decides"
    }]
  });
  assert.equal(out.ok, true);
  const hit = out.issues.find((i) => i.category === "conflict" && i.selector === "#app .nav");
  assert.ok(hit, "expected a conflict issue for #app .nav");
  assert.equal(hit.severity, "HIGH");
  assert.ok(hit.fix && hit.fix.length > 10, "expected a concrete fix direction");
});

test("(a) cross-trace near-tie specificity war sets winning/overridden", () => {
  const t1 = trace(".card", {
    winningDeclarations: [decl("display", "flex", ".a .card", [0, 2, 0], "cards.css", 12)]
  });
  const t2 = trace(".card", {
    winningDeclarations: [decl("display", "grid", ".b .card", [0, 2, 0], "theme.css", 40)]
  });
  const out = mod.aggregateIssues({ traces: [t1, t2] });
  const hit = out.issues.find((i) =>
    i.category === "conflict" && i.property === "display" && /specificity war/.test(i.detail));
  assert.ok(hit, "expected a cross-trace specificity-war issue");
  assert.equal(hit.severity, "HIGH");
  assert.ok(hit.winning && hit.winning.selector, "winning projection set");
  assert.ok(hit.overridden && hit.overridden.selector, "overridden projection set");
  assert.notEqual(hit.winning.selector, hit.overridden.selector);
});

test("(b) catches a dead @import chain", () => {
  const out = mod.aggregateIssues({
    stylesheets: [{
      href: "https://x.example/app.css",
      inDocumentStyleSheets: true,
      ruleCount: 10,
      imports: [{ url: "https://x.example/dead.css", loaded: false }],
      selectors: [],
      loadedHrefs: ["https://x.example/app.css"]
    }]
  });
  const hit = out.issues.find((i) => i.category === "missing" && /dead @import/.test(i.detail));
  assert.ok(hit, "expected a dead-@import missing issue");
  assert.ok(hit.detail.includes("dead.css"), "names the dead URL");
  assert.ok(hit.fix.includes("dead.css"), "fix names the dead URL");
});

test("(c) catches a hidden-overflow trap (scrollHeight > clientHeight + hidden)", () => {
  const t = trace(".sidebar", {
    geometry: { scrollWidth: 200, clientWidth: 200, scrollHeight: 400, clientHeight: 100 },
    computed: { display: "block", position: "static", overflowY: "hidden", backgroundImage: "none" },
    winningDeclarations: [decl("overflow-y", "hidden", ".sidebar", [0, 1, 0], "mail.css", 142)],
    hasText: true,
    scrollOwner: ".thread-list"
  });
  const out = mod.aggregateIssues({ traces: [t] });
  const hit = out.issues.find((i) => i.category === "trap" && /hidden content/.test(i.detail));
  assert.ok(hit, "expected a hidden-content trap issue");
  assert.equal(hit.severity, "HIGH");
  assert.ok(/mail\.css:142/.test(hit.fix), "fix cites the winning declaration source");
  assert.ok(/\.thread-list/.test(hit.fix), "fix names the scroll owner");
});

test("flags var(--name) referenced but undefined in the element chain", () => {
  const t = trace(".btn", {
    winningDeclarations: [decl("color", "var(--accent)", ".btn", [0, 1, 0], "ui.css", 8)],
    cssVariables: { "--bg": "#fff" }
  });
  const out = mod.aggregateIssues({ traces: [t] });
  const hit = out.issues.find((i) => i.category === "missing" && /--accent/.test(i.detail));
  assert.ok(hit, "expected an undefined-var issue");
  assert.equal(hit.severity, "HIGH");
});

test("flags !important escalation chains", () => {
  const winners = [];
  for (let i = 0; i < 5; i++) {
    winners.push(decl("display", "block", `.w${i}`, [0, 1, 0], "a.css", i + 1, { important: true }));
  }
  const out = mod.aggregateIssues({ traces: [trace("body", { winningDeclarations: winners })] });
  const hit = out.issues.find((i) => i.category === "conflict" && /!important/.test(i.detail));
  assert.ok(hit, "expected an !important escalation issue");
  assert.equal(hit.severity, "HIGH", "5 chained !important winners is HIGH");
});

test("flags duplicate fixed top docks", () => {
  const mk = (sel) => trace(sel, {
    computed: { display: "block", position: "fixed", top: "0px", backgroundImage: "none" }
  });
  const out = mod.aggregateIssues({ traces: [mk("#hdr"), mk(".dock")] });
  const hit = out.issues.find((i) => i.category === "conflict" && /duplicate fixed top/.test(i.detail));
  assert.ok(hit, "expected a duplicate-fixed-header issue");
  assert.equal(hit.severity, "HIGH");
});

test("flags mixed 100vh vs 100dvh root authorities", () => {
  const t1 = trace("body", {
    winningDeclarations: [decl("height", "100vh", "body", [0, 0, 1], "base.css", 3)]
  });
  const t2 = trace("#app", {
    winningDeclarations: [decl("min-height", "100dvh", "#app", [1, 0, 0], "app.css", 9)]
  });
  const out = mod.aggregateIssues({ traces: [t1, t2] });
  const hit = out.issues.find((i) => i.category === "conflict" && /viewport-height authorities/.test(i.detail));
  assert.ok(hit, "expected a viewport-height-authority issue");
  assert.equal(hit.severity, "HIGH");
});

test("flags zero author declarations on a visible element", () => {
  const t = trace(".naked", {
    winningDeclarations: [decl("display", "block", ".naked", [0, 1, 0], null, null, { origin: "user-agent" })]
  });
  const out = mod.aggregateIssues({ traces: [t] });
  const hit = out.issues.find((i) => i.category === "missing" && /zero author declarations/.test(i.detail));
  assert.ok(hit, "expected a UA-only styling issue");
  assert.equal(hit.severity, "MEDIUM");
});

test("flags stylesheets absent from document.styleSheets and zero-match selectors", () => {
  const out = mod.aggregateIssues({
    stylesheets: [{
      href: "https://x.example/late.css",
      inDocumentStyleSheets: false,
      ruleCount: 0,
      imports: [],
      selectors: [{ selector: ".ghost", matchedCount: 0 }],
      loadedHrefs: []
    }]
  });
  const absent = out.issues.find((i) => /absent from document\.styleSheets/.test(i.detail));
  assert.ok(absent, "expected an absent-stylesheet issue");
  const dead = out.issues.find((i) => i.severity === "LOW" && i.selector === ".ghost");
  assert.ok(dead, "expected a LOW zero-match-selector issue");
});

test("horizontal overflow is HIGH at phone width, MEDIUM on desktop", () => {
  const t = trace("body", {
    geometry: { scrollWidth: 460, clientWidth: 390, scrollHeight: 800, clientHeight: 800 }
  });
  const phone = mod.aggregateIssues({ traces: [t], viewport: { width: 390, height: 844 } });
  const hitPhone = phone.issues.find((i) => i.category === "trap" && /horizontal overflow/.test(i.detail));
  assert.ok(hitPhone);
  assert.equal(hitPhone.severity, "HIGH");
  const desk = mod.aggregateIssues({ traces: [t], viewport: { width: 1440, height: 900 } });
  const hitDesk = desk.issues.find((i) => i.category === "trap" && /horizontal overflow/.test(i.detail));
  assert.ok(hitDesk);
  assert.equal(hitDesk.severity, "MEDIUM");
});

test("ranks HIGH before MEDIUM before LOW and summarizes counts", () => {
  const out = mod.aggregateIssues({
    conflicts: [{ severity: "LOW", kind: "note", selector: "x", detail: "minor" }],
    traces: [
      trace(".trap", {
        geometry: { scrollWidth: 100, clientWidth: 100, scrollHeight: 500, clientHeight: 100 },
        computed: { display: "block", overflowY: "hidden", backgroundImage: "none" }
      })
    ],
    stylesheets: [{
      href: "s.css",
      inDocumentStyleSheets: true,
      selectors: [{ selector: ".zzz", matchedCount: 0 }],
      imports: [],
      loadedHrefs: ["s.css"]
    }]
  });
  const ranks = out.issues.map((i) => ({ HIGH: 0, MEDIUM: 1, LOW: 2 })[i.severity]);
  const sorted = ranks.slice().sort((a, b) => a - b);
  assert.deepEqual(ranks, sorted, "issues sorted HIGH→MEDIUM→LOW");
  assert.equal(out.summary.HIGH + out.summary.MED + out.summary.LOW, out.issues.length);
  assert.ok(out.summary.HIGH >= 1 && out.summary.LOW >= 1);
  assert.ok(out.runMeta.timestamp, "runMeta carries a timestamp");
});

test("empty input yields ok:true with zero issues", () => {
  const out = mod.aggregateIssues({});
  assert.equal(out.ok, true);
  assert.deepEqual(out.issues, []);
  assert.deepEqual(out.summary, { HIGH: 0, MED: 0, LOW: 0 });
});

test("fail-closed when the forensics module is absent (deterministic seam)", async () => {
  const res = await mod.cssImmediateIssues({}, { forensics: null });
  assert.equal(res.ok, false);
  assert.equal(res.error, "forensics_module_missing");
});

test("fail-closed through the real require path while cssForensics.js is missing", async () => {
  if (mod.forensicsAvailable()) {
    // Worker A landed the module after this test was written: composition is
    // live, so only assert the pure core still aggregates.
    const out = mod.aggregateIssues({});
    assert.equal(out.ok, true);
    return;
  }
  const res = await mod.cssImmediateIssues({ targetId: "nope" });
  assert.equal(res.ok, false);
  assert.equal(res.error, "forensics_module_missing");
});

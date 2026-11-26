// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Verifies the Awtsmoos CSS conflict tracer as a Tunnel app-api operation.
 * @description
 * The Awtsmoos traces every garment to its maker; these tests prove the
 * css.trace operation is cataloged, that virtual code supplied in the request
 * is traced in memory to its conflicting files, that URL mode refuses
 * loopback/private targets before any fetch, that unauthenticated gateway
 * calls are rejected, that input caps hold, and that the unstyled-elements
 * legs (static suspects + live computed-style classifier) report defects.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const CONTROL = path.resolve(__dirname, "..");
const { getOperation, GROUPS } = require(path.join(CONTROL, "docs", "appApiCatalog.js"));
const { appApiCall } = require(path.join(CONTROL, "routes", "appApiCallRoute.js"));
const factory = require(path.join(CONTROL, "core", "cssTraceDispatch.js"));
const Core = require(path.resolve(CONTROL, "..", "..", "..", "..", "scripts", "css-gate", "cssTraceCore.cjs"));

function fakeI(overrides = {}) {
	return {
		$_POST: {},
		$_GET: {},
		request: { headers: {}, method: "POST", query: {} },
		response: null,
		...overrides
	};
}

const CONFLICT_FILES = [
	{ name: "a.css", content: ".x { color: red; margin: 0; } .only-a { padding: 1px; }" },
	{ name: "b.css", content: ".x { color: blue; }" }
];

test("css.trace is cataloged in the tools group with a dispatch binding", () => {
	const op = getOperation("css.trace");
	assert.ok(op, "operation must exist");
	assert.equal(op.group, "tools");
	assert.ok(GROUPS.some(g => g.id === "tools"), "tools group must be registered");
	assert.equal(op.dispatch.module, "../core/cssTraceDispatch.js");
	assert.equal(op.dispatch.route, "/css/trace");
	assert.equal(typeof factory, "function");
	const probe = factory({ $i: fakeI(), userid: null });
	assert.equal(typeof probe["/css/trace"], "function");
});

test("virtual files trace returns the known conflict with winner and loser files", async () => {
	const handler = factory({ $i: fakeI({ $_POST: { files: CONFLICT_FILES } }) })["/css/trace"];
	const report = await handler({});
	assert.equal(report.ok, true);
	assert.equal(report.mode, "virtual");
	assert.equal(report.crossFileConflicts, 1);
	const conflict = report.conflicts[0];
	assert.equal(conflict.selector, ".x");
	assert.equal(conflict.property, "color");
	assert.equal(conflict.kind, "conflict-different-values");
	assert.equal(conflict.winner.file, "b.css", "later file wins at equal specificity");
	assert.equal(conflict.winner.value, "blue");
	assert.deepEqual(conflict.losers.map(l => l.file), ["a.css"]);
	assert.equal(report.shadowedDeclarations, 1);
	assert.equal(report.files.length, 2);
});

test("static unstyled leg flags classes no supplied stylesheet defines", async () => {
	const handler = factory({
		$i: fakeI({
			$_POST: {
				files: CONFLICT_FILES,
				html: [{ name: "page.html", content: "<div class=\"x missing-class\">hi</div><span id=\"ghost\">boo</span>" }]
			}
		})
	})["/css/trace"];
	const report = await handler({});
	assert.equal(report.ok, true);
	assert.equal(report.unstyledElements.leg, "static");
	const names = report.unstyledElements.suspects.map(s => s.name);
	assert.ok(names.includes("missing-class"), "undefined class must be a suspect");
	assert.ok(names.includes("ghost"), "undefined id must be a suspect");
	assert.ok(!names.includes("x"), "defined class must not be a suspect");
	const suspect = report.unstyledElements.suspects.find(s => s.name === "missing-class");
	assert.equal(suspect.page, "page.html");
	assert.equal(suspect.element, "<div>");
});

test("URL mode refuses loopback and private targets before fetching", async () => {
	for (const url of ["http://127.0.0.1:8080/social/", "http://localhost:8080/", "http://[::1]/", "http://192.168.1.10/admin", "https://10.0.0.5/"]) {
		const result = await factory.runTrace({ url });
		assert.equal(result.ok, false, url);
		assert.equal(result.error, "url_private", url);
	}
	const bad = await factory.runTrace({ url: "file:///etc/passwd" });
	assert.equal(bad.ok, false);
	assert.equal(bad.error, "url_protocol");
	assert.equal(Core.isPrivateIp("172.16.0.9"), true);
	assert.equal(Core.isPrivateIp("8.8.8.8"), false);
	assert.equal(Core.isPrivateIp("::ffff:127.0.0.1"), true);
});

test("gateway rejects an unauthenticated css.trace call", async () => {
	const raw = await appApiCall(fakeI({ $_POST: { operation: "css.trace", body: { files: CONFLICT_FILES } } }));
	const body = JSON.parse(raw);
	assert.equal(body.ok, false);
	assert.equal(body.error, "not_authenticated");
});

test("input caps are enforced", async () => {
	const big = await factory.runTrace({ files: [{ name: "big.css", content: ".a{color:red}" + " ".repeat(Core.CAPS.maxFileBytes) }] });
	assert.equal(big.ok, false);
	assert.equal(big.error, "file_too_large");
	const none = await factory.runTrace({});
	assert.equal(none.ok, false);
	assert.equal(none.error, "missing_input");
	const both = await factory.runTrace({ url: "https://example.com/", files: CONFLICT_FILES });
	assert.equal(both.ok, false);
	assert.equal(both.error, "ambiguous_input");
});

test("live-leg classifier flags default styling, contrast, interactive and zero-size defects", () => {
	const live = Core.analyzeComputedElements([
		{ tag: "BUTTON", id: "", classes: ["raw"], text: "Go", color: "rgb(0, 0, 0)", background: "rgb(255, 255, 255)", authorStyled: false, interactive: true, width: 60, height: 24 },
		{ tag: "P", id: "", classes: ["ghost"], text: "invisible words", color: "rgb(255, 255, 255)", background: "rgb(255, 255, 255)", authorStyled: true, interactive: false, width: 200, height: 18 },
		{ tag: "DIV", id: "", classes: ["collapsed"], text: "hidden content", color: "rgb(0, 0, 0)", background: "rgb(255, 255, 255)", authorStyled: true, interactive: false, width: 0, height: 0 },
		{ tag: "SPAN", id: "", classes: [], text: "plain", color: "rgb(0, 0, 0)", background: "rgb(255, 255, 255)", authorStyled: false, interactive: false, width: 40, height: 12 }
	], { page: "https://example.test/", candidateFiles: ["a.css", "b.css"] });
	assert.equal(live.leg, "live");
	const defects = live.findings.map(f => f.defect);
	assert.ok(defects.includes("interactive-unstyled"));
	assert.ok(defects.includes("low-contrast"));
	assert.ok(defects.includes("zero-size-content"));
	assert.ok(defects.includes("default-styled"));
	const contrast = live.findings.find(f => f.defect === "low-contrast");
	assert.equal(contrast.ratio, 1);
	assert.deepEqual(contrast.candidates, ["a.css", "b.css"]);
});

// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");

const {
	specificityOf,
	compareSpecificity,
	resolveWinningDeclarations,
	classifyHiddenContent,
	classifyHorizontalOverflow,
	classifyFixedSticky,
	classifyViewportAuthorities,
	classifyDeadStylesheets,
	chromeCssForensics,
} = require("../tools/chrome/cssForensics.js");

test("specificityOf counts ids, classes, and elements", () => {
	assert.deepEqual(specificityOf("#id"), [1, 0, 0]);
	assert.deepEqual(specificityOf(".a.b"), [0, 2, 0]);
	assert.deepEqual(specificityOf("div"), [0, 0, 1]);
	assert.deepEqual(specificityOf("ul li a"), [0, 0, 3]);
	assert.deepEqual(specificityOf("#a .b:hover"), [1, 2, 0]);
	assert.deepEqual(specificityOf("input[type=text]::placeholder"), [0, 1, 2]);
	assert.deepEqual(specificityOf("div#id.a[b]:hover::before"), [1, 3, 2]);
	assert.deepEqual(specificityOf("*"), [0, 0, 0]);
	assert.deepEqual(specificityOf(""), [0, 0, 0]);
});

test("specificityOf handles functional pseudo-classes", () => {
	assert.deepEqual(specificityOf(":not(.x)"), [0, 1, 0]);
	assert.deepEqual(specificityOf(":not(#x)"), [1, 0, 0]);
	assert.deepEqual(specificityOf(":where(.x)"), [0, 0, 0]);
	assert.deepEqual(specificityOf("div:where(.x)"), [0, 0, 1]);
	assert.deepEqual(specificityOf("li:nth-child(2n)"), [0, 1, 1]);
	assert.deepEqual(specificityOf(":is(#a, .b)"), [1, 0, 0]);
});

test("compareSpecificity orders tuples lexicographically", () => {
	assert.equal(compareSpecificity([1, 0, 0], [0, 9, 9]), 1);
	assert.equal(compareSpecificity([0, 2, 0], [0, 1, 9]), 1);
	assert.equal(compareSpecificity([0, 0, 3], [0, 0, 2]), 1);
	assert.equal(compareSpecificity([0, 1, 0], [0, 1, 0]), 0);
	assert.equal(compareSpecificity([0, 0, 1], [1, 0, 0]), -1);
});

function declaration(overrides = {}) {
	return {
		property: "color",
		value: "red",
		important: false,
		specificity: [0, 0, 1],
		order: 0,
		origin: "author",
		...overrides,
	};
}

test("resolveWinningDeclarations honors specificity over order", () => {
	const winners = resolveWinningDeclarations([
		declaration({ value: "early-specific", specificity: [0, 1, 0], order: 0 }),
		declaration({ value: "late-weak", specificity: [0, 0, 1], order: 5 }),
	]);
	assert.equal(winners.color.value, "early-specific");
});

test("resolveWinningDeclarations honors !important over specificity", () => {
	const winners = resolveWinningDeclarations([
		declaration({
			value: "normal-id",
			specificity: [1, 0, 0],
			order: 1,
		}),
		declaration({
			value: "important-class",
			important: true,
			specificity: [0, 1, 0],
			order: 0,
		}),
	]);
	assert.equal(winners.color.value, "important-class");
});

test("resolveWinningDeclarations honors origin order", () => {
	const winners = resolveWinningDeclarations([
		declaration({ value: "agent", origin: "user-agent", order: 9 }),
		declaration({ value: "user", origin: "user", order: 0 }),
		declaration({ value: "author", origin: "author", order: 0 }),
	]);
	assert.equal(winners.color.value, "author");
});

test("resolveWinningDeclarations breaks ties by source order", () => {
	const winners = resolveWinningDeclarations([
		declaration({ value: "first", order: 0 }),
		declaration({ value: "second", order: 1 }),
	]);
	assert.equal(winners.color.value, "second");
});

test("resolveWinningDeclarations handles multiple properties", () => {
	const winners = resolveWinningDeclarations([
		declaration({ property: "color", value: "red", order: 0 }),
		declaration({ property: "color", value: "blue", order: 1 }),
		declaration({ property: "margin", value: "0", order: 0 }),
	]);
	assert.equal(winners.color.value, "blue");
	assert.equal(winners.margin.value, "0");
});

test("classifyHiddenContent flags clipped scroll regions", () => {
	const finding = classifyHiddenContent({
		selector: "div.clip",
		overflowY: "hidden",
		scrollH: 500,
		clientH: 200,
	});
	assert.ok(finding);
	assert.equal(finding.severity, "HIGH");
	assert.equal(finding.kind, "hidden-content");
	assert.equal(finding.selector, "div.clip");
	assert.match(finding.detail, /300px/);
});

test("classifyHiddenContent ignores auto overflow and tiny deltas", () => {
	assert.equal(
		classifyHiddenContent({
			selector: "div.ok",
			overflowY: "auto",
			scrollH: 500,
			clientH: 200,
		}),
		null
	);
	assert.equal(
		classifyHiddenContent({
			selector: "div.ok",
			overflowY: "hidden",
			scrollH: 201,
			clientH: 200,
		}),
		null
	);
});

function metric(overrides = {}) {
	return {
		selector: "div.box",
		display: "block",
		position: "static",
		rect: { left: 0, right: 100, top: 0, bottom: 100, w: 100, h: 100 },
		...overrides,
	};
}

test("classifyHorizontalOverflow flags right-edge overflow", () => {
	const finding = classifyHorizontalOverflow(metric(), 390);
	assert.equal(finding, null);
	const wide = classifyHorizontalOverflow(
		metric({ selector: "div.wide", rect: { left: 0, right: 450, top: 0, bottom: 50, w: 450, h: 50 } }),
		390
	);
	assert.ok(wide);
	assert.equal(wide.severity, "HIGH");
	assert.equal(wide.kind, "horizontal-overflow");
	assert.match(wide.detail, /60px/);
});

test("classifyHorizontalOverflow flags negative left edge", () => {
	const finding = classifyHorizontalOverflow(
		metric({ rect: { left: -10, right: 90, top: 0, bottom: 50, w: 100, h: 50 } }),
		390
	);
	assert.ok(finding);
	assert.equal(finding.kind, "horizontal-overflow");
	assert.match(finding.detail, /10px/);
});

test("classifyHorizontalOverflow skips display:none", () => {
	assert.equal(
		classifyHorizontalOverflow(
			metric({
				display: "none",
				rect: { left: 0, right: 900, top: 0, bottom: 0, w: 0, h: 0 },
			}),
			390
		),
		null
	);
});

test("classifyFixedSticky flags intersection with primary content", () => {
	const fixed = metric({
		selector: "div.banner",
		position: "fixed",
		rect: { left: 0, right: 390, top: 0, bottom: 60, w: 390, h: 60 },
	});
	const primary = [
		{
			selector: "main",
			rect: { left: 0, right: 390, top: 0, bottom: 800, w: 390, h: 800 },
		},
	];
	const finding = classifyFixedSticky(fixed, primary);
	assert.ok(finding);
	assert.equal(finding.severity, "MED");
	assert.equal(finding.kind, "fixed-sticky-intersection");
});

test("classifyFixedSticky ignores static elements and misses", () => {
	const stat = metric({ position: "static" });
	assert.equal(classifyFixedSticky(stat, []), null);
	const far = metric({
		position: "sticky",
		rect: { left: 0, right: 50, top: 900, bottom: 950, w: 50, h: 50 },
	});
	const primary = [
		{
			selector: "main",
			rect: { left: 0, right: 390, top: 0, bottom: 800, w: 390, h: 800 },
		},
	];
	assert.equal(classifyFixedSticky(far, primary), null);
});

function owner(overrides = {}) {
	return {
		container: "html",
		selector: "html",
		property: "height",
		value: "100vh",
		specificity: [0, 0, 1],
		sourceUrl: "style.css",
		lineNumber: 3,
		...overrides,
	};
}

test("classifyViewportAuthorities flags two distinct rules", () => {
	const finding = classifyViewportAuthorities([
		owner(),
		owner({
			container: "body",
			selector: "body",
			property: "min-height",
			value: "100dvh",
			lineNumber: 12,
		}),
	]);
	assert.ok(finding);
	assert.equal(finding.severity, "HIGH");
	assert.equal(finding.kind, "competing-viewport-height");
	assert.match(finding.detail, /2 distinct rules/);
});

test("classifyViewportAuthorities ignores single or duplicate rules", () => {
	assert.equal(classifyViewportAuthorities([owner()]), null);
	assert.equal(classifyViewportAuthorities([owner(), owner()]), null);
	assert.equal(classifyViewportAuthorities([]), null);
});

test("classifyDeadStylesheets flags links missing from styleSheets", () => {
	const findings = classifyDeadStylesheets(
		["https://example.com/a.css", "https://example.com/b.css"],
		["https://example.com/a.css"]
	);
	assert.equal(findings.length, 1);
	assert.equal(findings[0].severity, "LOW");
	assert.equal(findings[0].kind, "dead-stylesheet");
	assert.match(findings[0].selector, /b\.css/);
	assert.equal(
		classifyDeadStylesheets(["https://example.com/a.css"], [
			"https://example.com/a.css",
		]).length,
		0
	);
});

test("chromeCssForensics rejects unknown mode without touching chrome", async () => {
	const result = await chromeCssForensics({ mode: "bogus" });
	assert.equal(result.ok, false);
	assert.equal(result.error, "unknown_mode");
});

test("chromeCssForensics trace mode requires a selector", async () => {
	const result = await chromeCssForensics({ mode: "trace" });
	assert.equal(result.ok, false);
	assert.equal(result.error, "missing_selector");
});

test("browser-backed traceCascade self-skips when chrome is unavailable", async t => {
	let enabled = false;
	try {
		const { loadConfig } = require("../lib/config.js");
		const config = loadConfig();
		enabled = Boolean(
			config && config.chrome && config.chrome.enabled && config.tools && config.tools.chrome
		);
	} catch (error) {
		enabled = false;
	}
	if (!enabled) {
		t.skip("chrome is not enabled; no live browser available");
		return;
	}
	const { traceCascade } = require("../tools/chrome/cssForensics.js");
	const report = await traceCascade({
		selector: "body",
		properties: ["display"],
	});
	assert.equal(report.selector, "body");
	assert.ok(Array.isArray(report.winningDeclarations));
});

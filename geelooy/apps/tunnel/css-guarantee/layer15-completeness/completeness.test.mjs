//B"H
//Boruch Hashem
// Layer 15 completeness tests. Run: node --test completeness.test.mjs

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
	auditCompleteness,
	extractThemeInfo,
	parseRules,
	suggestThemeFix
} from "./completeness.mjs";
import { parseColor, contrastRatio } from "./colors.mjs";

const src = (path, content) => ({ path, content });
const blockingSeverities = (findings) =>
	findings.filter((f) => ["medium", "high", "critical"].includes(f.severity));

describe("extractThemeInfo", () => {
	it("extracts dark theme and core from ancestor qualifier", () => {
		const info = extractThemeInfo('[data-theme="dark"] .panel');
		assert.equal(info.theme, "dark");
		assert.equal(info.core, ".panel");
	});
	it("strips :where() wrapper with :root qualifier", () => {
		const info = extractThemeInfo(':where(:root[data-theme="light"]) .post-reader-localized-context .typography-details');
		assert.equal(info.theme, "light");
		assert.equal(info.core, ".post-reader-localized-context .typography-details");
	});
	it("handles attached qualifier", () => {
		const info = extractThemeInfo('.post-reader-localized-context[data-theme="dark"]');
		assert.equal(info.theme, "dark");
		assert.equal(info.core, ".post-reader-localized-context");
	});
	it("returns null theme for unscoped selectors", () => {
		const info = extractThemeInfo(".panel .title");
		assert.equal(info.theme, null);
		assert.equal(info.core, ".panel .title");
	});
	it("uses media theme when no selector qualifier", () => {
		const info = extractThemeInfo(".panel", "dark");
		assert.equal(info.theme, "dark");
		assert.equal(info.themeSource, "media");
	});
});

describe("colors", () => {
	it("parses hex, rgb space syntax, and var fallback", () => {
		assert.deepEqual(parseColor("#2b2118"), { r: 43, g: 33, b: 24, a: 1 });
		assert.deepEqual(parseColor("rgb(5 13 27 / 92%)"), { r: 5, g: 13, b: 27, a: 0.92 });
		assert.deepEqual(parseColor("var(--reader-text, #f8fbff)"), { r: 248, g: 251, b: 255, a: 1 });
		assert.equal(parseColor("var(--reader-text)"), null);
	});
	it("contrast ratio of black on white is ~21", () => {
		const ratio = contrastRatio(parseColor("#000"), parseColor("#fff"));
		assert.ok(ratio > 20 && ratio < 22, `got ${ratio}`);
	});
	it("contrast ratio of white on white is 1", () => {
		const ratio = contrastRatio(parseColor("#fff"), parseColor("#ffffff"));
		assert.equal(ratio, 1);
	});
});

describe("check A — theme symmetry", () => {
	it("BLOCKS dark-only themed component when light is declared", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .panel { background: #111; }\n[data-theme="light"] .other { background: #fff; }`)
		];
		const { findings, blocking } = auditCompleteness(sources, { mode: "fail-closed" });
		const theme = findings.filter((f) => f.category === "css-completeness-theme");
		assert.equal(theme.length, 2, JSON.stringify(findings, null, 1)); // .panel missing light, .other missing dark
		assert.ok(theme.every((f) => f.severity === "high"));
		assert.equal(blocking, true);
	});
	it("passes when every themed component covers all themes", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .panel { background: #111; color: #eee; }\n[data-theme="light"] .panel { background: #fff; color: #111; }`)
		];
		const { findings, blocking } = auditCompleteness(sources, { mode: "fail-closed" });
		assert.equal(findings.filter((f) => f.category === "css-completeness-theme").length, 0);
		assert.equal(blocking, false);
	});
	it("does not require themes when only one theme is declared", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .panel { background: #111; }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		assert.equal(findings.filter((f) => f.category === "css-completeness-theme").length, 0);
	});
	it("fail-open never blocks", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .panel { background: #111; }\n[data-theme="light"] .other { background: #fff; }`)
		];
		const { blocking } = auditCompleteness(sources, { mode: "fail-open" });
		assert.equal(blocking, false);
	});
	it("skips @tunnel-grandfather files", () => {
		const sources = [
			src("a.css", `/* @tunnel-grandfather legacy */\n[data-theme="dark"] .panel { background: #111; }\n[data-theme="light"] .other { background: #fff; }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		assert.equal(findings.length, 0);
	});
	it("handles prefers-color-scheme media themes", () => {
		const sources = [
			src("a.css", `@media (prefers-color-scheme: dark) { .panel { background: #111; } }\n@media (prefers-color-scheme: light) { .other { background: #fff; } }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		assert.ok(findings.some((f) => f.category === "css-completeness-theme"));
	});
});

describe("check B — state×theme symmetry", () => {
	it("BLOCKS themed hover missing in the other theme", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .btn:hover { filter: brightness(1.2); }\n[data-theme="light"] .btn { background: #fff; }\n[data-theme="dark"] .btn { background: #111; }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		const state = findings.filter((f) => f.category === "css-completeness-state-theme");
		assert.equal(state.length, 1, JSON.stringify(findings, null, 1));
		assert.equal(state[0].severity, "medium");
	});
	it("passes when hover exists in both themes", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .btn:hover { filter: brightness(1.2); }\n[data-theme="light"] .btn:hover { filter: brightness(0.9); }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		assert.equal(findings.filter((f) => f.category === "css-completeness-state-theme").length, 0);
	});
});

describe("check C — critical properties", () => {
	it("BLOCKS critical on white-on-white text", () => {
		const sources = [
			src("a.css", `.note { color: #ffffff; background-color: #fffdf6; }`)
		];
		const { findings, blocking } = auditCompleteness(sources, { mode: "fail-closed" });
		const inv = findings.filter((f) => f.category === "css-completeness-invisible-text");
		assert.equal(inv.length, 1, JSON.stringify(findings, null, 1));
		assert.equal(inv[0].severity, "critical");
		assert.equal(blocking, true);
	});
	it("BLOCKS high on low-contrast text", () => {
		const sources = [
			src("a.css", `.note { color: #999999; background-color: #ffffff; }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		const low = findings.filter((f) => f.category === "css-completeness-low-contrast");
		assert.equal(low.length, 1, JSON.stringify(findings, null, 1));
		assert.equal(low[0].severity, "high");
	});
	it("passes readable text", () => {
		const sources = [
			src("a.css", `.note { color: #2b2118; background-color: #fffdf6; }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		assert.equal(findings.filter((f) => f.category.startsWith("css-completeness-")).length, 0);
	});
	it("BLOCKS transparent text color", () => {
		const sources = [
			src("a.css", `.ghost { color: transparent; }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		assert.ok(findings.some((f) => f.category === "css-completeness-invisible-text"));
	});
	it("BLOCKS background without explicit color when color is set in another theme", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .x { color: #fff; }\n[data-theme="light"] .x { color: #111; }\n[data-theme="dark"] .card { background-color: #111; color: #eee; }\n[data-theme="light"] .card { background-color: #fff; }`)
		];
		const { findings, blocking } = auditCompleteness(sources, { mode: "fail-closed" });
		const bg = findings.filter((f) => f.category === "css-completeness-bg-without-color");
		// .card light sets background but no color, while dark sets color → asymmetric omission.
		assert.equal(bg.length, 1, JSON.stringify(findings, null, 1));
		assert.equal(bg[0].severity, "medium");
		assert.equal(blocking, true);
	});
	it("reports advisory (non-blocking) when color is never set anywhere", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .x { color: #fff; }\n[data-theme="light"] .x { color: #111; }\n.card { background-color: #fff; padding: 1rem; }`)
		];
		const { findings, blocking } = auditCompleteness(sources, { mode: "fail-closed" });
		const advisory = findings.filter((f) => f.category === "css-completeness-bg-inherits-color");
		// .card is base-only: checked once per declared theme (dark + light), advisory only.
		assert.equal(advisory.length, 2, JSON.stringify(findings, null, 1));
		assert.ok(advisory.every((f) => f.severity === "low"));
		assert.equal(blocking, false);
	});
	it("catches theme-resolved contrast via CSS variables", () => {
		const sources = [
			src("a.css", `:root[data-theme="light"] { --ink: #21160a; }\n:root[data-theme="dark"] { --ink: #f8fbff; }\n.panel { color: var(--ink); background: rgb(5 13 27); }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		// light theme: #21160a on rgb(5 13 27) → very low contrast → high/critical
		const contrast = findings.filter((f) =>
			f.category === "css-completeness-low-contrast" || f.category === "css-completeness-invisible-text");
		assert.ok(contrast.length >= 1, JSON.stringify(findings, null, 1));
		// dark theme: #f8fbff on rgb(5 13 27) → fine, no finding for dark
		assert.ok(!contrast.some((f) => f.message.includes('[data-theme="dark"]')));
	});
});

describe("check D — theme-blind literals", () => {
	it("BLOCKS hardcoded dark-mode component with no theme variants", () => {
		// The exact historical settings-panel bug shape.
		const sources = [
			src("a.css", `[data-theme="dark"] .x { color: #fff; }\n[data-theme="light"] .x { color: #111; }\n.typography-details { background: rgb(5 13 27 / 92%); color: var(--reader-text, #f8fbff); }`)
		];
		const { findings, blocking } = auditCompleteness(sources, { mode: "fail-closed" });
		const blind = findings.filter((f) => f.category === "css-completeness-theme-blind");
		assert.equal(blind.length, 1, JSON.stringify(findings, null, 1));
		assert.equal(blind[0].severity, "medium");
		assert.equal(blocking, true);
	});
	it("passes components with theme variants", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .x { color: #fff; }\n[data-theme="light"] .x { color: #111; }\n[data-theme="dark"] .panel { background: #111; color: #eee; }\n[data-theme="light"] .panel { background: #fff; color: #111; }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		assert.equal(findings.filter((f) => f.category === "css-completeness-theme-blind").length, 0);
	});
	it("passes light hardcoded backgrounds (not the dark-blind pattern)", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .x { color: #fff; }\n[data-theme="light"] .x { color: #111; }\n.card { background: #fffdf6; color: #2b2118; }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		assert.equal(findings.filter((f) => f.category === "css-completeness-theme-blind").length, 0);
	});
	it("treats :not([data-theme=dark]) as the light variant", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .x { color: #fff; }\n[data-theme="light"] .x { color: #111; }\n:where(:root:not([data-theme="dark"])) .panel { background: #fff; color: #111; }\n[data-theme="dark"] .panel { background: #111; color: #eee; }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		// The :not() rule covers light; no theme-symmetry finding for .panel.
		const theme = findings.filter((f) => f.category === "css-completeness-theme");
		assert.equal(theme.length, 0, JSON.stringify(theme, null, 1));
	});
	it("resolves vars from :not([data-theme=dark]) rules into the light bucket (not dark)", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .x { color: #fff; }\n[data-theme="light"] .x { color: #111; }\n:where(:root[data-theme="dark"]) .s { --ink: #c9b992; }\n:where(:root:not([data-theme="dark"])) .s { --ink: #5a4c3d; }\n.card { background: #111; color: var(--ink); }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		const low = findings.filter((f) => f.category === "css-completeness-low-contrast");
		// Dark: --ink resolves to #c9b992 (light tan) on #111 → fine, no finding.
		// Light: --ink resolves to #5a4c3d (dark) on #111 → 2.28, genuine finding.
		// Before the :not() fix, the :not() rule overwrote the dark bucket and
		// BOTH themes reported.
		assert.equal(low.length, 1, JSON.stringify(low, null, 1));
		assert.ok(low[0].message.includes('[data-theme="light"]'), low[0].message);
	});
	it("ignores translucent scrims (not opaque)", () => {
		const sources = [
			src("a.css", `[data-theme="dark"] .x { color: #fff; }\n[data-theme="light"] .x { color: #111; }\n.overlay { background: rgb(1 5 13 / 52%); color: #fff; }`)
		];
		const { findings } = auditCompleteness(sources, { mode: "fail-closed" });
		assert.equal(findings.filter((f) => f.category === "css-completeness-theme-blind").length, 0);
	});
});

describe("suggestThemeFix", () => {
	it("generates a starter block", () => {
		const css = suggestThemeFix(".panel", "light");
		assert.ok(css.includes('[data-theme="light"]'));
		assert.ok(css.includes(".panel"));
	});
});

describe("parseRules", () => {
	it("parses rules with declarations and offsets", () => {
		const rules = parseRules(`.a { color: red; }\n.b { background: blue !important; }`);
		assert.equal(rules.length, 2);
		assert.equal(rules[0].declarations.get("color").value, "red");
		assert.equal(rules[1].declarations.get("background").important, true);
	});
	it("descends into @media and records theme", () => {
		const rules = parseRules(`@media (prefers-color-scheme: dark) { .a { color: #fff; } }`);
		assert.equal(rules.length, 1);
		assert.equal(rules[0].mediaTheme, "dark");
	});
	it("skips @keyframes", () => {
		const rules = parseRules(`@keyframes spin { from { transform: rotate(0); } }`);
		assert.equal(rules.length, 0);
	});
});

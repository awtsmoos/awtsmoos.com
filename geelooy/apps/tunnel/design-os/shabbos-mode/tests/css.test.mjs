//B"H — Shabbos Mode CSS tests. Run: node tests/css.test.mjs
import { strict as assert } from "node:assert";
import { shabbosCss, printCss } from "../css.mjs";

// 1. Motion is killed.
{
	const css = shabbosCss();
	assert.ok(css.includes("animation: none !important"), "kills animation");
	assert.ok(css.includes("transition: none !important"), "kills transition");
	assert.ok(css.includes("scroll-behavior: auto !important"), "kills smooth scroll");
	console.log("ok 1 - all motion killed");
}

// 2. Scoped under .shabbos-mode.
{
	const css = shabbosCss();
	assert.ok(css.includes(".shabbos-mode"), "scoped class present");
	assert.ok(!/^\s*\*\s*\{/m.test(css), "no unscoped universal selector");
	console.log("ok 2 - fully scoped under .shabbos-mode");
}

// 3. Interactive chrome hidden, hidden content expanded.
{
	const css = shabbosCss();
	for (const sel of [".comments-section", "form", ".carousel", ".tab-nav", ".modal"]) {
		assert.ok(css.includes(sel), `hides ${sel}`);
	}
	for (const sel of [".accordion-panel", ".tab-panel", ".collapsible-content"]) {
		assert.ok(css.includes(sel), `expands ${sel}`);
	}
	console.log("ok 3 - interactive chrome hidden, collapsed content expanded");
}

// 4. Warm sefer palette + Hebrew typography.
{
	const css = shabbosCss();
	assert.ok(css.includes("#faf5ea"), "warm paper default");
	assert.ok(css.includes("Noto Serif Hebrew"), "hebrew serif stack");
	assert.ok(css.includes('direction: rtl'), "rtl for hebrew");
	console.log("ok 4 - warm palette and Hebrew typography");
}

// 5. Custom palette + expandSelectors honored.
{
	const css = shabbosCss({
		palette: { paper: "#ffffff", ink: "#000000", accent: "#111111", muted: "#333333" },
		expandSelectors: [".my-secret-panel"],
	});
	assert.ok(css.includes("--shabbos-paper: #ffffff"), "custom paper");
	assert.ok(css.includes(".my-secret-panel"), "custom expand selector");
	console.log("ok 5 - custom palette and expandSelectors");
}

// 6. Print stylesheet: page rules, break control, link URLs.
{
	const css = printCss();
	assert.ok(css.includes("@page"), "@page rule");
	assert.ok(css.includes("@media print"), "@media print");
	assert.ok(css.includes("break-after: avoid"), "heading break control");
	assert.ok(css.includes("orphans: 3"), "orphans/widows");
	assert.ok(css.includes('attr(href)'), "prints link URLs");
	console.log("ok 6 - print stylesheet complete");
}

// 7. Print unscoped option.
{
	const css = printCss({ unscoped: true });
	assert.ok(css.includes("@media print"), "still media print");
	assert.ok(!css.includes(".shabbos-mode"), "no scope when unscoped");
	console.log("ok 7 - unscoped print option");
}

console.log("\nAll css tests passed.");

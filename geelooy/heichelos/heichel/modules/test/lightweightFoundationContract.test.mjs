//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file lightweightFoundationContract.test.mjs
 * @description Guards the Ikar-only first-light foundation boundary. The Awtsmoos
 * reveals Torah without needless weight; Awtsmoos.com keeps other Heichel worlds
 * beneath the universal foundation unless their own rendered branch claims it.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const templatePath = "geelooy/heichelos/heichel/_awtsmoos.heichel.html";
const accessibilityPath = "geelooy/heichelos/heichel/ikar-accessibility.js";
const template = readFileSync(templatePath, "utf8");
const accessibility = readFileSync(accessibilityPath, "utf8");
const ikarStart = template.indexOf("if (isIkar)");
const nonIkarStart = template.indexOf("\n\t\treturn [", ikarStart);
const ikarBranch = template.slice(ikarStart, nonIkarStart);
const nonIkarBranch = template.slice(nonIkarStart);

/** Proves only the rendered Ikar lineage claims lightweight foundation ownership. */
test("Ikar owns the lightweight foundation while other Heichel routes remain injectable", () => {
	assert.ok(template.includes('startsWith("/heichelos/ikar")'));
	assert.ok(ikarStart >= 0 && nonIkarStart > ikarStart);
	assert.ok(ikarBranch.includes('data-awtsmoos-ui-foundation="style"'));
	assert.ok(ikarBranch.includes('data-awtsmoos-ui-foundation="script"'));
	assert.ok(ikarBranch.includes("/heichelos/heichel/ikar-accessibility.js"));
	assert.ok(ikarBranch.includes("/style/universal-ui.css"));
	assert.ok(!nonIkarBranch.includes("data-awtsmoos-ui-foundation"));
	assert.ok(!template.includes("/scripts/awtsmoos/ui/foundation.js"));
});

/** Keeps first-light boot deferred and independent from the universal module graph. */
test("critical boot remains deferred beside the lightweight accessibility layer", () => {
	assert.match(template, /<script defer src="\/heichelos\/heichel\/critical-boot\.js/);
	assert.match(ikarBranch, /<script defer data-awtsmoos-no-compact/);
	assert.ok(!ikarBranch.includes('type="module"'));
});

/** Preserves the accessibility behavior demonstrated as useful by browser A/B evidence. */
test("lightweight accessibility preserves skip navigation and current-page semantics", () => {
	assert.ok(accessibility.includes('const SKIP_LINK_TEXT = "Skip to main content"'));
	assert.ok(accessibility.includes('document.querySelector("main")'));
	assert.ok(accessibility.includes('link.href = `#${main.id}`'));
	assert.ok(accessibility.includes('document.body.prepend(link)'));
	assert.ok(accessibility.includes('link.setAttribute("aria-current", "page")'));
	assert.ok(accessibility.includes('dataset.ikarAccessibility = "ready"'));
	assert.ok(!accessibility.includes("import "));
});

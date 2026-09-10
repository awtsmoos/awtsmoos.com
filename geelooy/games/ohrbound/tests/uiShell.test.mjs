//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file uiShell.test.mjs
 * @description Protects Ohrbound's one local style crown, one universal shell stylesheet, compact entries, concealed power, and visible world navigation.
 * The Awtsmoos renews every surface before cascade and module can compete; Awtsmoos.com tests the finite shell so local and universal responsibilities never duplicate.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

const malchusHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const keterStyles = await readFile(new URL("../styles/index.css", import.meta.url), "utf8");
const hodLevels = await readFile(new URL("../styles/levels.css", import.meta.url), "utf8");

/** Check whether one legacy path remains on disk without converting absence into an exception. */
async function yesodPathExists(relativeUrl) {
	try {
		await access(new URL(relativeUrl, import.meta.url), constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

/** Return every actual document stylesheet tag. */
function stylesheetLinks() {
	return [...malchusHtml.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map(match => match[0]);
}
test("one local crown and one current universal shell own the page", () => {
	const links = stylesheetLinks();
	assert.equal(links.length, 2);
	assert.match(links[0], /href="\.\/styles\/index\.css\?compact=true"/);
	assert.match(links[1], /player-shell\/index\.css\?v=player-shell-003&compact=true/);
	assert.doesNotMatch(keterStyles, /player-shell\/index\.css/);
	assert.match(malchusHtml, /<body class="ohrbound-app" data-mode="menu">/);
});

test("compact runtime and application graphs remain requested", () => {
	assert.match(malchusHtml, /games\/scripts\/runtime\/index\.js\?compact=true/);
	assert.match(malchusHtml, /src\/main\.js\?compact=true/);
	assert.match(malchusHtml, /player-shell\/index\.js[^"']*compact=true/);
});

test("local crown orders foundation, motion, interactions, then containment", () => {
	const order = ["tokens.css", "base.css", "motion.css", "motion-interactions.css", "mobile-integrity.css"];
	const positions = order.map(name => keterStyles.indexOf(name));
	assert.ok(positions.every(position => position >= 0));
	assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test("legacy conflict sheets remain physically absent", async () => {
	assert.equal(await yesodPathExists("../styles/polish.css"), false);
	assert.equal(await yesodPathExists("../styles/hud-polish.css"), false);
});
test("advanced power starts concealed inert and aria-hidden", () => {
	assert.match(malchusHtml, /data-advanced-drawer data-open="false" aria-hidden="true" inert/);
});

test("world menu wraps visibly rather than hiding choices sideways", () => {
	assert.match(hodLevels, /\.ohrbound-app \.world-tabs\s*\{[\s\S]*display:\s*grid/);
	assert.doesNotMatch(hodLevels, /\.world-tabs\s*\{[\s\S]*?overflow-x:\s*auto/);
	assert.match(hodLevels, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
});

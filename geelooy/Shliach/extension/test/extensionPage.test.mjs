// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Proves the /Shliach/extension page is a real Shliach sub page (same
 * contract as the other sub pages) and that every version card it shows
 * links to a ZIP that actually exists on disk, with the right permissions,
 * a warning on the Unrestricted version, and a working permission search.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION = path.resolve(HERE, "..");
const GEOLOOY = path.resolve(EXTENSION, "../..");
const PAGE = path.join(EXTENSION, "index.html");
const DOWNLOADS = path.join(EXTENSION, "downloads");

const html = fs.readFileSync(PAGE, "utf8");

test("page: follows the Shliach sub-page contract", () => {
	assert.match(html, /<title>[^<]*Awtsmoos[^<]*Shliach[^<]*<\/title>/i);
	assert.match(html, /canonical[^>]+https:\/\/awtsmoos\.com\/Shliach\/extension\//);
	assert.match(html, /name="description" content="[^"]{40,}"/);
	assert.match(html, /name="robots" content="index,follow,max-image-preview:large"/);
	assert.match(html, /\/style\/shliach\/index\.css/);
	assert.match(html, /\/style\/shliach\/extension\.css\?v=[0-9a-f]{10}/);
	assert.match(html, /\/scripts\/shliach\/index\.js/);
	assert.match(html, /\/scripts\/shliach\/extensionFilter\.js\?v=[0-9a-f]{10}/);
	assert.match(html, /https:\/\/chatgpt\.com\/g\/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent/);
	assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
	// The nav marks this page as current, and the main page links here.
	assert.match(html, /href="\/Shliach\/extension\/" aria-current="page"/);
	const main = fs.readFileSync(path.join(GEOLOOY, "Shliach/index.html"), "utf8");
	assert.match(main, /href="\/Shliach\/extension\/">Extension<\/a>/);
	assert.match(main, /href="\/Shliach\/extension\/">Choose a version →<\/a>/);
});

test("page: three version cards, each with a ZIP that exists on disk", () => {
	const cards = html.match(/data-extension-card/g) ?? [];
	assert.equal(cards.length, 3);
	for (const [version, zip] of [
		["minimal", "awtsmoos-shliach-browser-minimal-1.0.0.zip"],
		["standard", "awtsmoos-shliach-browser-standard-1.0.0.zip"],
		["unrestricted", "awtsmoos-shliach-browser-unrestricted-1.0.0.zip"],
	]) {
		assert.match(html, new RegExp(`data-version="${version}"`), `missing ${version} card`);
		assert.match(html, new RegExp(`href="/Shliach/extension/downloads/${zip}"`), `missing ${version} ZIP link`);
		assert.ok(fs.existsSync(path.join(DOWNLOADS, zip)), `${zip} is linked but not on disk`);
		const zipBytes = fs.statSync(path.join(DOWNLOADS, zip)).size;
		assert.ok(zipBytes > 10000, `${zip} looks too small (${zipBytes} bytes)`);
		// The SHA-256 printed on the page matches the file.
		const sums = fs.readFileSync(path.join(DOWNLOADS, "SHA256SUMS.txt"), "utf8");
		const hash = sums.split("\n").find((l) => l.trim().endsWith(zip)).split(/\s+/)[0];
		assert.ok(html.includes(hash), `page does not print the real SHA-256 for ${zip}`);
	}
});

test("page: permission lists match the built manifests", () => {
	const expected = {
		minimal: ["activeTab", "scripting", "storage", "awtsmoos.com"],
		standard: ["tabs", "storage", "downloads", "awtsmoos.com"],
		unrestricted: ["debugger", "tabs", "storage", "downloads", "unlimitedStorage", "offscreen", "webNavigation", "webRequest", "all_urls"],
	};
	for (const [version, perms] of Object.entries(expected)) {
		const card = html.match(new RegExp(`data-version="${version}"[\\s\\S]*?</article>`))[0];
		for (const perm of perms) {
			assert.ok(card.includes(`data-permission="${perm}"`), `${version} card is missing permission ${perm}`);
		}
	}
	// Minimal and Standard say plainly they cannot use the debugger or log the network.
	for (const version of ["minimal", "standard"]) {
		const card = html.match(new RegExp(`data-version="${version}"[\\s\\S]*?</article>`))[0];
		assert.match(card, /no debugger/i);
		assert.match(card, /no network logging/i);
	}
});

test("page: the Unrestricted version carries a prominent warning", () => {
	const card = html.match(/data-version="unrestricted"[\s\S]*?<\/article>/)[0];
	assert.match(card, /role="alert"/);
	assert.match(card, /Warning — read this before installing/);
	assert.match(card, /can see everything in your browser/i);
	assert.match(card, /only if you trust the agent/i);
	assert.match(card, /debugging.*banner/i);
});

test("page: permission search and without-toggles are wired", () => {
	assert.match(html, /data-extension-filter/);
	assert.match(html, /data-extension-search/);
	assert.match(html, /placeholder="[^"]*debugger[^"]*"/);
	for (const toggle of ["debugger", "all_urls", "webRequest"]) {
		assert.match(html, new RegExp(`data-without="${toggle}"`));
		assert.match(html, new RegExp(`data-without="${toggle}" aria-pressed="false"`));
	}
	assert.match(html, /data-extension-count/);
	assert.match(html, /data-extension-empty/);
	// The filter script exists and the page references it by its content hash.
	const filter = fs.readFileSync(path.join(GEOLOOY, "scripts/shliach/extensionFilter.js"), "utf8");
	assert.match(filter, /data-extension-search/);
	assert.match(filter, /data-without/);
	assert.match(filter, /data-hidden/);
});

test("page: install steps and the agent-connection explainer are present", () => {
	assert.match(html, /chrome:\/\/extensions/);
	assert.match(html, /Load unpacked/);
	assert.match(html, /Developer mode/);
	assert.match(html, /wss:\/\/awtsmoos\.com\/api\/shliach\/relay/);
	assert.match(html, /shliach-browser/);
	assert.match(html, /pairing code/i);
	assert.match(html, /ten minutes/i);
});

test("page: the four agent capabilities and the stealth promise are stated", () => {
	// A dedicated section names each capability and how invisibly it reads.
	assert.match(html, /id="what-it-sees"/);
	for (const command of ["page.html", "page.dom", "page.summary", "page.elements"]) {
		assert.match(html, new RegExp(command.replace(".", "\\.")), `page does not name ${command}`);
	}
	assert.match(html, /Raw HTML/);
	assert.match(html, /The DOM, resolved/);
	assert.match(html, /compact summary/i);
	assert.match(html, /What to click/);
	assert.match(html, /stable selector/i);
	// Stealth: the debugger path is invisible; the in-page paths are
	// honest about their limit.
	assert.match(html, /The page doesn't know/);
	assert.match(html, /no injected script/i);
	assert.match(html, /no content script/i);
	assert.match(html, /navigator\.webdriver/);
	assert.match(html, /debugging.*banner/i);
	assert.match(html, /Honest limit/);
	// Every version card says it can read the page this way.
	for (const version of ["minimal", "standard", "unrestricted"]) {
		const card = html.match(new RegExp(`data-version="${version}"[\\s\\S]*?</article>`))[0];
		assert.match(card, /raw HTML/i, `${version} card does not promise raw HTML`);
		assert.match(card, /DOM tree/i, `${version} card does not promise the DOM tree`);
		assert.match(card, /summary/i, `${version} card does not promise a summary`);
		assert.match(card, /clickable elements/i, `${version} card does not promise clickable elements`);
	}
	// The 64 KiB relay limit and the chunking are stated, not hidden.
	assert.match(html, /64 KiB/);
	assert.match(html, /32,000/);
	assert.match(html, /chunk/i);
});

test("page: the connection section lists the agent commands", () => {
	const section = html.match(/id="how-it-connects"[\s\S]*?<\/section>/)[0];
	for (const command of ["page.html", "page.dom", "page.summary", "page.elements", "page.read", "page.click", "page.fill", "page.navigate", "page.evaluate", "page.screenshot", "network.start", "network.stream"]) {
		assert.ok(section.includes(`<code>${command}</code>`), `connection section does not list ${command}`);
	}
});

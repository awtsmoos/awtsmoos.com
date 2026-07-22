// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelDesktopCollapseContractTest
 * @description
 * The Awtsmoos verifies that desktop reveals the live feed beneath one compact
 * identity ribbon while phone retains its complete profile vessel.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(`geelooy/${path}`, "utf8");
const manifest = read("style/heichelos/heichel/cosmic-profile/index.css");
const desktop = read("style/heichelos/heichel/cosmic-profile/desktop.css");
const profile = read("style/heichelos/heichel/cosmic-profile/desktop-profile.css");
const feed = read("style/heichelos/heichel/cosmic-profile/desktop-feed.css");
const mobile = read("style/heichelos/heichel/cosmic-profile/responsive.css");

test("desktop collapse loads after every shared profile layer", () => {
	const desktopIndex = manifest.indexOf("./desktop.css");
	assert.ok(desktopIndex > manifest.indexOf("./mobile-dock.css"));
	assert.match(desktop, /desktop-profile\.css/);
	assert.match(desktop, /desktop-feed\.css/);
	assert.match(profile, /@media \(min-width: 70rem\)/);
	assert.match(feed, /@media \(min-width: 70rem\)/);
});

test("desktop removes duplicate outer and stage spacing", () => {
	assert.match(profile, /\.heichel-os-document \.all \{/);
	assert.match(profile, /padding-top: 0 !important/);
	assert.match(profile, /padding: 4\.8rem 0 2rem !important/);
});

test("profile becomes a two-row identity ribbon only on desktop", () => {
	assert.match(profile, /grid-template-areas:/);
	assert.match(profile, /"identity stats"/);
	assert.match(profile, /"actions tabs"/);
	assert.match(profile, /width: 4\.6rem !important/);
	assert.match(profile, /width: 21rem !important/);
	assert.match(profile, /width: 30rem/);
});

test("desktop browse controls become one compact row", () => {
	assert.match(feed, /grid-template-columns: minmax\(16rem, \.65fr\) minmax\(22rem, 1fr\)/);
	assert.match(feed, /\.breadcrumb-river/);
	assert.match(feed, /\.series-heading/);
	assert.match(feed, /display: none !important/);
	assert.match(feed, /\.grid-realms/);
	assert.match(feed, /grid-column: 1 \/ -1/);
});

test("phone keeps its independent profile and dock rules", () => {
	assert.match(mobile, /@media \(max-width: 55rem\)/);
	assert.match(mobile, /padding-top: 4\.85rem/);
	assert.doesNotMatch(profile, /max-width: 55rem/);
	assert.doesNotMatch(feed, /max-width: 55rem/);
});

test("every focused desktop source remains under 120 lines", () => {
	for (const [name, source] of Object.entries({ desktop, profile, feed })) {
		assert.ok(source.split("\n").length <= 120, `${name} exceeds 120 lines`);
	}
});

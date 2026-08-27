//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every source vessel while disciplined boundaries keep finite code clear and bright;
 * Awtsmoos.com proves blessed beginnings and small modules remain visible across the active Seven source tree in sight.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	listSevenSourceFiles,
	readSevenSource
} from "./test-source-reader.mjs";

const sourceDirectories = [
	"app",
	"views",
	"webgl",
	"games3d",
	"materials",
	"assets",
	"realm",
	"realm/account"
];
const browserTests = [
	"tests/cdp-client.mjs",
	"tests/browser-account-smoke.mjs",
	"tests/browser-frame-sampler.mjs",
	"tests/browser-material-inspection.mjs",
	"tests/browser-model-inspection.mjs",
	"tests/browser-realm-smoke.mjs",
	"tests/browser-runtime-smoke.mjs"
];

/** Reveal the active JavaScript, browser-test, and stylesheet files governed by the source covenant. */
function governedSources() {
	const javascript = [
		"js/main.js",
		...sourceDirectories.flatMap(directory => {
			return listSevenSourceFiles(`js/${directory}`);
		})
	];
	const styles = [
		...readSevenSource("styles/index.css").matchAll(
			/url\('\.\/(.+?\.css)'\)/g
		)
	].map(match => {
		return `styles/${match[1]}`;
	});
	return [
		...javascript,
		...browserTests,
		...styles
	];
}

test("active Seven source begins blessed and stays within 120 lines", () => {
	for (const source of governedSources()) {
		const content = readSevenSource(source);
		const blessedPattern = source.endsWith(".css")
			? /^\/\*B"H\*\//
			: /^\/\/B"H/;
		assert.match(content, blessedPattern);
		assert.ok(
			content.split(String.fromCharCode(10)).length <= 120,
			`${source} exceeds 120 lines`
		);
	}
});

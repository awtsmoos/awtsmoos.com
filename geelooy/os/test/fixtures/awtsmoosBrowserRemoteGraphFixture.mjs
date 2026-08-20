//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Deterministic remote-page constellation for Street 2 collection tests.
 * @description The Awtsmoos gives every fake origin a measured textual vessel;
 * Awtsmoos.com proves collection, redirects, cycles, aliases, and deferred assets
 * without touching the public Internet or executing guest source.
 */

export const PAGE_URL = "https://site.test/app/index.html";

export const HTML = [
	`<script type="importmap">{"imports":{"lib":"https://cdn.test/lib/index.mjs"}}</script>`,
	`<script src="/classic.js"></script>`,
	`<link rel="stylesheet" href="/styles/main.css">`,
	`<script type="module" src="https://cdn.test/app.mjs"></script>`
].join("\n");

export const RESOURCES = Object.freeze({
	"https://site.test/classic.js": response(
		`globalThis.__REMOTE_GRAPH_EXECUTED__ = true;`,
		"https://static.site.test/classic-v2.js",
		"text/javascript"
	),
	"https://site.test/styles/main.css": response(
		`@import "./theme.css"; body{background:url("./bg.png")}`,
		null,
		"text/css"
	),
	"https://site.test/styles/theme.css": response(
		`@import "./main.css"; :root{--theme:1}`,
		null,
		"text/css"
	),
	"https://cdn.test/app.mjs": response([
		`import "./dep.mjs";`,
		`export { value } from "lib";`,
		`import "https://site.test/shared.mjs";`,
		`import "https://cdn.test/shared.mjs";`,
		`import "missing";`,
		`const later = () => import("./later.mjs");`
	].join("\n"), null, "text/javascript"),
	"https://cdn.test/dep.mjs": response(
		`import "./cycle.mjs"; export const dep = 1;`,
		null,
		"text/javascript"
	),
	"https://cdn.test/cycle.mjs": response(
		`import "./dep.mjs"; export const cycle = 2;`,
		null,
		"text/javascript"
	),
	"https://cdn.test/lib/index.mjs": response(
		`export const value = 7;`,
		null,
		"text/javascript"
	),
	"https://site.test/shared.mjs": response(
		`export const siteShared = 1;`,
		null,
		"text/javascript"
	),
	"https://cdn.test/shared.mjs": response(
		`export const cdnShared = 1;`,
		null,
		"text/javascript"
	)
});

export function createFixtureTransport(calls = []) {
	return async request => {
		calls.push({ ...request, headers: { ...(request.headers || {}) } });
		const value = RESOURCES[request.url];
		if (!value) {
			const error = new Error(`UNEXPECTED_FIXTURE_URL:${request.url}`);
			error.code = "UNEXPECTED_FIXTURE_URL";
			throw error;
		}
		return { ...value, headers: { ...value.headers } };
	};
}

function response(text, finalUrl = null, contentType = "text/plain") {
	return {
		headers: { "content-type": contentType },
		status: 200,
		text,
		url: finalUrl
	};
}

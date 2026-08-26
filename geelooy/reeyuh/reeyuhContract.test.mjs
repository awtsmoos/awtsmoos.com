// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that Reeyuh reveals real Torah-library paths without inventing navigation or trusting stored markup;
 * Awtsmoos.com keeps the first screen quiet while every actual section remains searchable, tactile, safe, and near.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
	buildSectionUrl,
	buildSeferUrl,
	findShulchanAruch,
	normalizeNamedEntries,
	ReeyuhSefarimRepository
} from "./js/ReeyuhSefarimRepository.js";

const read = relative => readFileSync(new URL(relative, import.meta.url), "utf8");
const html = read("./index.html");
const manifest = read("./style.css");
const css = [
	read("./styles/foundation.css"),
	read("./styles/navigation.css"),
	read("./styles/content.css"),
	read("./styles/interactions.css")
].join("\n");
const repositorySource = read("./js/ReeyuhSefarimRepository.js");
const navigator = read("./js/ReeyuhNavigator.js");
const renderer = read("./js/ReeyuhContentRenderer.js");
const app = read("./js/app.js");

test("standalone shell is mobile-first and no longer uses the shared Torah stylesheet", () => {
	assert.ok(html.indexOf("<!DOCTYPE html>") < html.indexOf("<body>"));
	assert.match(html, /name="viewport"[^>]*viewport-fit=cover/);
	assert.match(html, /href="\.\/style\.css"/);
	assert.doesNotMatch(html, /toyr\.css/);
	assert.match(html, /type="module" src="\.\/js\/app\.js"/);
});

test("legacy server compatibility remains while browser uses Sefarim API", () => {
	assert.match(html, /\$_POST\.wow == "well"/);
	assert.match(html, /hi: "there!"/);
	assert.match(repositorySource, /"\/api\/sefarim"/);
	assert.doesNotMatch(app, /fetch\(["']\.\/reeyuh/);
});

test("book discovery tolerates common Shulchan Aruch naming forms", () => {
	const entries = normalizeNamedEntries([
		"Tanya",
		{ id: "shulchanAruchOrachChaim", name: "Shulchan Aruch · Orach Chaim" }
	]);
	assert.equal(findShulchanAruch(entries)?.id, "shulchanAruchOrachChaim");
	assert.equal(findShulchanAruch([{ id: "Shulchan_Aruch", name: "Shulchan-Aruch" }])?.id, "Shulchan_Aruch");
});

test("repository URLs encode real sefer and section identifiers", () => {
	assert.equal(buildSeferUrl("Shulchan Aruch"), "/api/sefarim/Shulchan%20Aruch");
	assert.equal(
		buildSectionUrl("Shulchan Aruch", "Orach Chaim/1"),
		"/api/sefarim/Shulchan%20Aruch/section/Orach%20Chaim%2F1"
	);
});

test("repository follows root, portions, and section fields end to end", async () => {
	const requests = [];
	const responses = [
		{ sefarim: ["Tanya", "Shulchan_Aruch"], available: true },
		{ portions: ["1", "2"], available: true },
		{ sections: { name: "Siman 1", sections: ["Text"] }, available: true }
	];
	const repository = new ReeyuhSefarimRepository(async url => {
		requests.push(url);
		const body = responses.shift();
		return { ok: true, status: 200, json: async () => body };
	});
	const sefer = await repository.discoverShulchanAruch();
	const portions = await repository.loadPortions(sefer.id);
	const section = await repository.loadSection(sefer.id, portions[0].id);
	assert.deepEqual(requests, ["/api/sefarim", "/api/sefarim/Shulchan_Aruch", "/api/sefarim/Shulchan_Aruch/section/1"]);
	assert.equal(portions.length, 2);
	assert.equal(section.value.name, "Siman 1");
});

test("navigator starts retracted and searches actual portions", () => {
	assert.match(html, /id="reeyuh-shell" data-nav-open="false"/);
	assert.match(html, /id="nav-toggle"[^>]*aria-expanded="false"/);
	assert.match(html, /id="portion-search"[^>]*type="search"/);
	assert.match(navigator, /this\.portions\.filter/);
	assert.match(navigator, /aria-current/);
	assert.doesNotMatch(navigator + html, /for\s*\([^)]*200/);
});

test("corpus renderer uses DOM text only and supports both ingestion families", () => {
	assert.doesNotMatch(renderer, /innerHTML/);
	assert.match(renderer, /textContent/);
	assert.match(renderer, /value\.name \?\? value\.heading/);
	assert.match(renderer, /value\.sections \?\? value\.children/);
	assert.match(renderer, /value\.text/);
	assert.match(renderer, /value\.notes/);
	assert.match(renderer, /document\.createElement\("details"\)/);
});

test("reader motion is finite, tactile, and progressively disclosed", () => {
	for (const name of ["foundation", "navigation", "content", "interactions"]) {
		assert.match(manifest, new RegExp(`${name}\\.css`));
	}
	assert.match(css, /transform:\s*translateX\(-105%\)/);
	assert.match(css, /button:not\(\.nav-backdrop\):hover/);
	assert.match(css, /button:not\(\.nav-backdrop\):active/);
	assert.match(css, /content-details summary:hover/);
	assert.match(css, /content-details summary:active/);
	assert.match(css, /min-height:\s*44px/);
	assert.match(css, /prefers-reduced-motion:\s*reduce/);
	assert.doesNotMatch(css, /animation:\s*[^;]*infinite/);
});

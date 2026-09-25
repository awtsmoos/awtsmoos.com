//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Awtsmoos Browser Production Contract
 * @description
 * The Awtsmoos recreates every browser vessel according to its present truth.
 * Awtsmoos.com proves the trusted shell is browser-first, real tabs stay bounded,
 * and developer machinery stays deliberately deeper than ordinary browsing.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const BROWSER = "programs/awtsmoos-browser";
const CORE_FILES = Object.freeze([
	"browserAdvancedPanel.js",
	"browserChrome.js",
	"browserDeveloperTools.js",
	"browserStyleLoader.js",
	"browserViewport.js",
	"index.js",
	"navigationState.js",
	"proxyClient.js",
	"remoteSurface.js",
	"runtime.js",
	"surface.js"
].map(name => `${BROWSER}/${name}`));

test("browser shell production files obey source and isolation law", async () => {
	for (const relativePath of CORE_FILES) {
		const source = await sourceText(relativePath);
		assert.ok(source.split(/\r?\n/).length <= 120, `${relativePath} exceeds 120 lines`);
		assert.match(source, /^\/\/B"H\n\/\/Boruch Hashem\n\/\/Blessed be He/);
		assert.match(source, /@(module|file)/);
		assert.doesNotMatch(source, /contentWindow\.eval/);
		assert.doesNotMatch(source, /\beval\s*\(/);
		assert.doesNotMatch(source, /new Function|AsyncFunction/);
		assert.doesNotMatch(source, /createElement\(["']iframe/);
	}
});

test("registry exposes Awtsmoos Browser without replacing HTML preview defaults", async () => {
	const modules = await sourceText("basicProgramModules.js");
	const registry = await sourceText("basicProgramRegistry.js");
	assert.match(modules, /awtsmoosBrowser:\s*program\("Awtsmoos Browser",\s*"\.\/programs\/awtsmoos-browser\/index\.js"\)/);
	assert.match(modules, /lazyProgram/);
	assert.match(registry, /"\.merkava":\s*\["awtsmoosBrowser",\s*"advancedCodeEditor"\]/);
	assert.match(registry, /"\.html":\s*"workspacePreview"/);
	assert.match(registry, /"\.htm":\s*"workspacePreview"/);
	assert.match(registry, /"\.merkava":\s*"awtsmoosBrowser"/);
});

test("Merkava loader keeps nested-window dependencies in order", async () => {
	const source = await sourceText(`${BROWSER}/merkavaLoader.js`);
	const ordered = [
		"VirtualWindowPlatform",
		"VirtualWindowHelpers",
		"VirtualWindowCore",
		"VirtualWindow",
		"PersistentBrowserRuntime",
		"NestedRuntimePolicy",
		"NestedBrowserRuntime"
	];
	let previous = -1;
	for (const moduleName of ordered) {
		const index = source.indexOf(`"${moduleName}"`);
		assert.ok(index > previous, `${moduleName} is missing or out of order`);
		previous = index;
	}
});

test("browser garments ship real responsive multi-tab UX", async () => {
	const base = await sourceText(`${BROWSER}/style.css`);
	const tabs = await sourceText(`${BROWSER}/tabs.css`);
	const controls = await sourceText(`${BROWSER}/tabControls.css`);
	const viewport = await sourceText(`${BROWSER}/viewport.css`);
	const advanced = await sourceText(`${BROWSER}/advanced.css`);
	const responsive = await sourceText(`${BROWSER}/responsive.css`);
	const loader = await sourceText(`${BROWSER}/browserStyleLoader.js`);
	assert.match(tabs, /awtsmoos-browser-tab-strip/);
	assert.match(tabs, /overflow-x:\s*auto/);
	assert.match(controls, /awtsmoos-browser-new-tab/);
	assert.doesNotMatch(controls, /awtsmoos-browser-new-tab[\s\S]*display:\s*none/);
	assert.match(viewport, /awtsmoos-browser-embedded-frame/);
	assert.match(advanced, /awtsmoos-browser-advanced-panel/);
	assert.match(responsive, /@media \(pointer:\s*coarse\)/);
	assert.match(responsive, /prefers-reduced-motion/);
	assert.match(loader, /fileName:\s*"style\.css"/);
	for (const name of ["tabs", "tabControls", "chrome", "viewport", "advanced",
		"remote", "interactive", "shliach", "responsive"]) {
		assert.match(base, new RegExp(`${name}\\.css`));
	}
});

test("entrypoint loads modular styles and no longer claims Chromium-first UI", async () => {
	const entry = await sourceText(`${BROWSER}/index.js`);
	const startup = await sourceText(`${BROWSER}/browserProgramStartup.js`);
	assert.match(startup, /ensureBrowserStyles/);
	assert.match(startup, /createBrowserNavigationCoordinator/);
	assert.match(entry, /modeBadge\.textContent = "Starting"/);
	assert.doesNotMatch(entry, /living Chromium faces/);
});

async function sourceText(relativePath) {
	return readFile(new URL(relativePath, ROOT), "utf8");
}

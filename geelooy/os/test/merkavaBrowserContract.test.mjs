//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);
const BROWSER = "programs/awtsmoos-browser";
const FILES = Object.freeze([
	`${BROWSER}/canvasColor.js`,
	`${BROWSER}/canvasRenderer.js`,
	`${BROWSER}/index.js`,
	`${BROWSER}/merkavaLoader.js`,
	`${BROWSER}/navigationState.js`,
	`${BROWSER}/proxyClient.js`,
	`${BROWSER}/remoteControlState.js`,
	`${BROWSER}/remoteNavigationController.js`,
	`${BROWSER}/remoteNavigationPolicy.js`,
	`${BROWSER}/remoteSurface.js`,
	`${BROWSER}/runtime.js`,
	`${BROWSER}/surface.js`,
	`${BROWSER}/webglPainter.js`,
	`${BROWSER}/style.css`,
	`${BROWSER}/remote.css`
]);

/**
 * The Awtsmoos creates the custom browser contract anew; Awtsmoos.com proves its
 * registry, guest paint path, remote host controls, mobile garment, and absence of
 * iframe/host evaluation across every production Browser vessel.
 */
test("Merkava browser production files obey source and isolation law", async () => {
	for (const relativePath of FILES) {
		const source = await sourceText(relativePath);
		assert.ok(source.split(/\r?\n/).length <= 120, `${relativePath} exceeds 120 lines`);
		assert.match(source, /Awtsmoos/);
		assert.doesNotMatch(source, /contentWindow\.eval/);
		assert.doesNotMatch(source, /\beval\s*\(/);
		assert.doesNotMatch(source, /new Function|AsyncFunction/);
		assert.doesNotMatch(source, /createElement\(["']iframe/);
	}
});

test("registry exposes the browser without replacing HTML preview defaults", async () => {
	const registry = await sourceText("basicPrograms.js");
	const mappings = await sourceText("basicProgramMappings.js");
	assert.match(registry, /import awtsmoosBrowser/);
	assert.match(registry, /awtsmoosBrowser: program\(/);
	assert.match(mappings, /"\.merkava": "awtsmoosBrowser"/);
	assert.match(mappings, /"\.html": "workspacePreview"/);
	assert.match(registry, /export const programs/);
	assert.match(registry, /export function getDefaultProgram/);
});

test("loader includes every split nested-window dependency in order", async () => {
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

test("browser garments preserve distinct desktop, mobile and remote layouts", async () => {
	const source = await sourceText(`${BROWSER}/style.css`);
	const remote = await sourceText(`${BROWSER}/remote.css`);
	assert.match(source, /grid-template-columns: minmax\(240px, 32%\)/);
	assert.match(source, /@media \(max-width: 760px\)/);
	assert.match(source, /grid-template-columns: 1fr/);
	assert.match(source, /prefers-reduced-motion/);
	assert.match(remote, /flex-wrap: wrap/);
	assert.match(remote, /min-width: 0/);
	assert.match(remote, /@media \(max-width: 760px\)/);
});

test("remote browser stays alias-scoped and same-origin", async () => {
	const client = await sourceText(`${BROWSER}/proxyClient.js`);
	const entry = await sourceText(`${BROWSER}/index.js`);
	assert.match(client, /credentials: "same-origin"/);
	assert.match(client, /\/api\/social\/drive\//);
	assert.match(client, /BROWSER_ALIAS_REQUIRED/);
	assert.match(entry, /remote\.css/);
	assert.match(entry, /createRemoteNavigationController/);
});

async function sourceText(relativePath) {
	return readFile(new URL(relativePath, ROOT), "utf8");
}

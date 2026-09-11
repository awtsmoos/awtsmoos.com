//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

/**
 * @file agencyContract.test.mjs
 * @description Guards the Agency Control Center source law, trusted transport,
 * text-only rendering, and complete responsive style graph.
 */

const root = path.resolve("geelooy/cloud/agency");

async function source(relative) {
	return readFile(path.join(root, relative), "utf8");
}

test("Agency JavaScript vessels obey source law", async () => {
	const files = (await readdir(root)).filter(file => file.endsWith(".js"));
	for (const file of files) {
		const text = await source(file);
		assert.ok(text.split("\n").length < 120, `${file} exceeds 119 lines`);
		assert.ok(text.startsWith('//B"H\n//Boruch Hashem\n//Blessed be He\n'));
		assert.doesNotMatch(text, /^ +(?!(?:\*|\/\*))/m);
	}
});

test("Agency style graph is complete and bounded", async () => {
	const entry = await source("styles/style.css");
	for (const name of ["tokens", "layout", "components", "cards", "responsive"]) {
		assert.match(entry, new RegExp(`@import url\\("\\./${name}\\.css"\\)`));
		const css = await source(`styles/${name}.css`);
		assert.ok(css.split("\n").length < 120, `${name}.css exceeds 119 lines`);
		assert.ok(css.startsWith('/* B"H */\n/* Boruch Hashem */\n/* Blessed be He */\n'));
	}
});

test("Agency transport keeps reads separate from guarded mutations", async () => {
	const data = await source("data.js");
	assert.match(data, /\/api\/wallet\/organizations/);
	assert.match(data, /\/api\/wallet\/marketplace/);
	assert.match(data, /\/api\/wallet\/resource\/quote/);
	assert.match(data, /X-Awtsmoos-Wallet-Action/);
	assert.match(data, /method: "POST"/);
	assert.match(data, /credentials: "include"/);
});

test("Agency rendering treats server testimony as text", async () => {
	const view = await source("view.js");
	assert.doesNotMatch(view, /innerHTML|insertAdjacentHTML|outerHTML/);
	assert.match(view, /textContent/);
	assert.match(view, /ownedByViewer/);
	assert.doesNotMatch(view, /deliveryRef/);
});

test("Agency markup exposes every revenue operator surface", async () => {
	const html = await source("index.html");
	for (const id of [
		"createOrganizationForm",
		"fundOrganizationForm",
		"allocateBudgetForm",
		"memberForm",
		"quoteForm",
		"marketplaceCreateForm",
		"organizationGrid",
		"marketplaceGrid"
	]) {
		assert.match(html, new RegExp(`id="${id}"`));
	}
	assert.match(html, /Pay only for real usage/);
	assert.match(html, /Tunnel for zero compute Perutas/);
	assert.match(html, /Buy Perutas/);
});

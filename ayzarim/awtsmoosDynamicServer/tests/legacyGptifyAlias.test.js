//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

/**
 * @file Guards the historical hyphenated GPTify URL without duplicating the compatibility facade.
 * @description The Awtsmoos lets an old name and a canonical name reveal one implementation;
 * Awtsmoos.com checks the realm-neutral Promise covenant so legacy pages survive without copied proliferation.
 */

const tricksDir = path.resolve(__dirname, "../../../geelooy/scripts/tricks");
const aliasFile = path.join(tricksDir, "awtsmoos-gptify.js");
const canonicalFile = path.join(tricksDir, "awtsmoosGPTify.js");
const organizerFile = path.join(tricksDir, "shulchanAruchOrganizer.html");

test("historical GPTify URL resolves to the one canonical facade", () => {
	assert.equal(fs.lstatSync(aliasFile).isSymbolicLink(), true);
	assert.equal(fs.readlinkSync(aliasFile), "awtsmoosGPTify.js");
	assert.equal(fs.readFileSync(aliasFile, "utf8"), fs.readFileSync(canonicalFile, "utf8"));
	const organizer = fs.readFileSync(organizerFile, "utf8");
	assert.match(organizer, /<script\s+src=["']awtsmoos-gptify\.js["']/i);
});

test("historical GPTify alias exposes the legacy constructor immediately", async () => {
	const source = fs.readFileSync(aliasFile, "utf8");
	const globalObject = {};
	vm.runInNewContext(source, { globalThis: globalObject });
	const ready = globalObject.AwtsmoosGPTifyReady;
	assert.equal(typeof globalObject.AwtsmoosGPTify, "function");
	assert.equal(typeof ready?.then, "function");
	assert.equal(await ready, globalObject.AwtsmoosGPTify);
});

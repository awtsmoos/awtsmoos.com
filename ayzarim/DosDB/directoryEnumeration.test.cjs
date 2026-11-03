//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @file directoryEnumeration.test.cjs
 * @description Db-phase2 bounded enumeration: the alphabetical fast path
 * (stat only the requested page) and the chunked-stat time paths must
 * return pages IDENTICAL to the original stat-everything algorithm, and
 * the getObjectKeys wrapper must return identical key lists for large
 * directory collections, small directory collections, and file-backed
 * array records (the P4 page-vs-collection contract).
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsPromises = require("node:fs").promises;
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const directoryMethods = require("./methods/directory.js");
const DosDB = require("./index.js");
const awtsmoosJSON = require("./awtsmoosBinary/awtsmoosBinaryJSON/index.js");

// Reference implementation of the ORIGINAL algorithm (stat every
// entry, sort everything, then slice) to compare pages against.
async function referencePage(directoryPath, { page = 1, pageSize = 60, sortBy = "alphabetical", order = "asc" } = {}) {
	const startIndex = (page - 1) * pageSize;
	let entries = await fsPromises.readdir(directoryPath, { withFileTypes: true });
	entries = await Promise.all(entries.map(async (dirent) => {
		const stats = await fsPromises.stat(path.join(directoryPath, dirent.name));
		return {
			name: dirent.name,
			created: stats.birthtime,
			modified: stats.mtime,
			type: stats?.isDirectory?.() ? "directory" : "file"
		};
	}));
	if (sortBy === "alphabetical") entries.sort((a, b) => order === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
	if (sortBy === "createdBy") entries.sort((a, b) => order === "asc" ? a.created - b.created : b.created - a.created);
	if (sortBy === "modifiedBy") entries.sort((a, b) => order === "asc" ? a.modified - b.modified : b.modified - a.modified);
	return entries.slice(startIndex, startIndex + pageSize);
}

function shape(entries) {
	return entries.map(e => ({ name: e.name, createdMs: +e.created, modifiedMs: +e.modified, type: e.type }));
}

async function callIndices(directoryPath, options) {
	return directoryMethods.getDirectoryIndecies.call({}, {
		directoryPath,
		fs: fsPromises,
		keepJSON: true,
		...options
	});
}

test("bounded enumeration pages equal the stat-everything reference", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-enum-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	for (let i = 0; i < 250; i++) {
		if (i % 25 === 0) fs.mkdirSync(path.join(root, `dir${String(i).padStart(3, "0")}`));
		else fs.writeFileSync(path.join(root, `f${String(i).padStart(3, "0")}.awtsmoosJSON`), "{}");
	}
	for (const sortBy of ["alphabetical", "createdBy", "modifiedBy"]) {
		for (const page of [1, 2, 5]) {
			const bounded = await callIndices(root, { page, pageSize: 30, sortBy, order: "asc" });
			const reference = await referencePage(root, { page, pageSize: 30, sortBy, order: "asc" });
			assert.deepEqual(shape(bounded), shape(reference), `${sortBy} page ${page} diverged`);
		}
		const boundedDesc = await callIndices(root, { page: 1, pageSize: 30, sortBy, order: "desc" });
		const referenceDesc = await referencePage(root, { page: 1, pageSize: 30, sortBy, order: "desc" });
		assert.deepEqual(shape(boundedDesc), shape(referenceDesc), `${sortBy} desc page diverged`);
	}
});

test("getObjectKeys wrapper: large + small directory collections and array records", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-keys-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const db = new DosDB(root);

	const big = path.join(root, "big");
	fs.mkdirSync(big);
	const expectedBig = [];
	for (let i = 0; i < 300; i++) {
		const name = `k${String(i).padStart(3, "0")}`;
		expectedBig.push(name);
		fs.writeFileSync(path.join(big, `${name}.awtsmoosJSON`), "{}");
	}
	assert.deepEqual(await db.getObjectKeys("big"), expectedBig.sort(), "large collection keys diverged");

	const small = path.join(root, "small");
	fs.mkdirSync(small);
	for (const name of ["aleph", "beis", "gimmel"]) {
		fs.writeFileSync(path.join(small, `${name}.awtsmoosJSON`), "{}");
	}
	const smallKeys = await db.getObjectKeys("small");
	assert.deepEqual([...smallKeys].sort(), ["aleph", "beis", "gimmel"], "small collection keys diverged");

	// File-backed stored array keeps the historical values-as-keys result.
	fs.writeFileSync(path.join(root, "arr.awtsmoosJSON"), awtsmoosJSON.serializeJSON(["x", "y", "z"]));
	const arrKeys = await db.getObjectKeys("arr");
	assert.deepEqual(arrKeys, ["x", "y", "z"], "array record keys diverged");
});

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file docsStateSchema.test.mjs
 * @description Proves that Docs shareable state survives URL reading and writing without mutable schema leakage.
 * The Awtsmoos is beyond address and memory; Awtsmoos.com lets each URL remain an honest vessel,
 * so copied documentation roads restore the same visible chamber without carrying stale dimensions along.
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
	createEmptyDocsState,
	docsStateFromLocation,
	docsUrlForState
} from "../modules/DocsStateSchema.mjs";

/** Proves each empty state call reveals an independent mutable vessel. */
function proveIndependentMalchusRecords() {
	const chesedFirst = createEmptyDocsState();
	const gevurahSecond = createEmptyDocsState();
	chesedFirst.doc = "changed";
	assert.equal(gevurahSecond.doc, "");
	assert.notStrictEqual(chesedFirst, gevurahSecond);
}

/** Proves URL search and hash dimensions return to their canonical state names. */
function proveYesodLocationParsing() {
	const yesodLocation = new URL(
		"https://awtsmoos.com/docs/?view=api&route=tunnel&family=control#retry-policy"
	);
	const malchusState = docsStateFromLocation(yesodLocation);
	assert.equal(malchusState.view, "api");
	assert.equal(malchusState.route, "tunnel");
	assert.equal(malchusState.family, "control");
	assert.equal(malchusState.heading, "retry-policy");
	assert.equal(malchusState.project, "");
}

/** Proves URL writing removes stale known dimensions while preserving unrelated query evidence. */
function proveTiferesUrlWriting() {
	const tiferesState = createEmptyDocsState();
	tiferesState.view = "systems";
	tiferesState.system = "realtime";
	tiferesState.heading = "evidence";
	const malchusUrl = docsUrlForState(
		"https://awtsmoos.com/docs/?view=api&route=old&utm_source=test#old",
		tiferesState
	);
	assert.equal(malchusUrl.searchParams.get("view"), "systems");
	assert.equal(malchusUrl.searchParams.get("system"), "realtime");
	assert.equal(malchusUrl.searchParams.has("route"), false);
	assert.equal(malchusUrl.searchParams.get("utm_source"), "test");
	assert.equal(malchusUrl.hash, "#evidence");
}

test("empty Docs state returns independent records", proveIndependentMalchusRecords);
test("location parsing restores explorer dimensions and heading", proveYesodLocationParsing);
test("URL writing removes stale known state while preserving unrelated parameters", proveTiferesUrlWriting);

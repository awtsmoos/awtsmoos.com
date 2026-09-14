//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { ChromeTargetCreator } from "./ChromeTargetCreator.mjs";

/**
 * @file Proves target creation reconciles uncertainty without duplicate browser birth.
 * @description
 * A timed-out creation may already have succeeded inside Chrome. Tests therefore
 * require one exact new target to be adopted and ambiguous target sets to fail closed.
 */
function blank(id) {
	return {
		id,
		type: "page",
		url: "about:blank",
		webSocketDebuggerUrl: `ws://${id}`
	};
}

test("timed-out create adopts one unambiguous new blank target", async () => {
	let lists = 0;
	let creates = 0;
	const creator = new ChromeTargetCreator({
		port: 9226,
		timeoutMs: 500,
		discovery: {
			listTargets: async () => ++lists === 1 ? [blank("old")] : [blank("old"), blank("new")]
		},
		fetcher: async () => {
			creates += 1;
			return new Promise(() => {});
		}
	});
	const startedAt = Date.now();
	const target = await creator.create();
	assert.equal(target.id, "new");
	assert.equal(creates, 1);
	assert.equal(lists, 2);
	assert.ok(Date.now() - startedAt < 2000);
});

test("ambiguous post-timeout targets fail without a second create", async () => {
	let lists = 0;
	let creates = 0;
	const creator = new ChromeTargetCreator({
		port: 9226,
		timeoutMs: 500,
		discovery: {
			listTargets: async () => ++lists === 1
				? [blank("old")]
				: [blank("old"), blank("new-a"), blank("new-b")]
		},
		fetcher: async () => {
			creates += 1;
			return new Promise(() => {});
		}
	});
	await assert.rejects(
		creator.create(),
		error => error.code === "chrome_target_creation_ambiguous" &&
			error.targetIds.length === 2
	);
	assert.equal(creates, 1);
	assert.equal(lists, 2);
});

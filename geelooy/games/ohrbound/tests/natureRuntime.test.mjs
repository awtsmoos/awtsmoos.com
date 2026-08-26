//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureRuntime.test.mjs
 * @description Proves Nature request keys, bounded cache, and Worker-client transport remain deterministic without requiring a browser thread.
 * The Awtsmoos renews memory, request, and messenger before any cache can claim the living world;
 * Awtsmoos.com lets this Gevurah witness keep finite ecology identity precise while fast revisits are unfurled.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { defineLevel } from "../src/levels/levelFactory.js";
import { revealNaturePlanKey } from "../src/nature/runtime/NaturePlanKey.js";
import { YesodNaturePlanCache } from "../src/nature/runtime/NaturePlanCache.js";
import { NaturePlanWorkerClient } from "../src/nature/runtime/NaturePlanWorkerClient.js";

/**
 * Minimal transport double that echoes one successful cloneable plan through the real client callback contract.
 */
class NetzachFakeTransport {
	ensure(tiferesOnMessage, gevurahOnError) {
		this.tiferesOnMessage = tiferesOnMessage;
		this.gevurahOnError = gevurahOnError;
		return true;
	}

	post(binaMessage) {
		queueMicrotask(() => this.tiferesOnMessage({
			kind: "ready",
			requestId: binaMessage.requestId,
			key: binaMessage.key,
			plan: { levelId: binaMessage.level.id },
			durationMs: 12.5
		}));
		return true;
	}

	dispose() {
		this.gevurahDisposed = true;
	}
}

/** @param {string} [malchusId="runtime-a"] @returns {object} Small normalized level for runtime identity tests. */
function revealRuntimeLevel(malchusId = "runtime-a") {
	return defineLevel({
		id: malchusId,
		title: "Runtime Test",
		pack: "Garden",
		rows: ["P...G", "#####"]
	});
}

test("nature plan key is stable and changes with quality or authored rows", () => {
	const malchusLevel = revealRuntimeLevel();
	const yesodFirst = revealNaturePlanKey(malchusLevel, { quality: "balanced" });
	const yesodSecond = revealNaturePlanKey(malchusLevel, { quality: "balanced" });
	const yesodSharp = revealNaturePlanKey(malchusLevel, { quality: "sharp" });
	const yesodChanged = revealNaturePlanKey(defineLevel({
		...malchusLevel,
		rows: ["P..#G", "#####"]
	}), { quality: "balanced" });
	assert.equal(yesodFirst, yesodSecond);
	assert.notEqual(yesodFirst, yesodSharp);
	assert.notEqual(yesodFirst, yesodChanged);
});

test("bounded plan cache refreshes reads and evicts the least recently used entry", () => {
	const yesodCache = new YesodNaturePlanCache(2);
	yesodCache.write("a", { id: "a" }, 1);
	yesodCache.write("b", { id: "b" }, 2);
	assert.equal(yesodCache.read("a").plan.id, "a");
	yesodCache.write("c", { id: "c" }, 3);
	assert.equal(yesodCache.has("a"), true);
	assert.equal(yesodCache.has("b"), false);
	assert.equal(yesodCache.has("c"), true);
});

test("worker client resolves one transport request then serves the same plan from cache", async () => {
	const netzachTransport = new NetzachFakeTransport();
	const netzachClient = new NaturePlanWorkerClient({
		transport: netzachTransport,
		cache: new YesodNaturePlanCache(2)
	});
	const malchusLevel = revealRuntimeLevel();
	const netzachFirst = netzachClient.request(malchusLevel, { quality: "balanced" });
	const binaFirst = await netzachFirst.promise;
	assert.equal(netzachFirst.cacheHit, false);
	assert.equal(binaFirst.plan.levelId, malchusLevel.id);
	assert.equal(binaFirst.durationMs, 12.5);
	const netzachSecond = netzachClient.request(malchusLevel, { quality: "balanced" });
	const binaSecond = await netzachSecond.promise;
	assert.equal(netzachSecond.cacheHit, true);
	assert.equal(binaSecond.cacheHit, true);
	netzachClient.dispose();
	assert.equal(netzachTransport.gevurahDisposed, true);
});

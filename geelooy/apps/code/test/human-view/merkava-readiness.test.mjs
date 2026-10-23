//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { test } from "node:test";
import { waitForMerkavaReady } from "../../js/features/human-view/analysis/merkava-readiness.js";

test("Merkava readiness survives a parser that arrives after init returns", async () => {
	const fake = {
		parserClass: null,
		async init() {
			setTimeout(() => {
				this.parserClass = class DelayedParser {};
			}, 60);
		}
	};
	assert.equal(await waitForMerkavaReady(fake, 400), true);
	assert.equal(typeof fake.parserClass, "function");
});

test("Merkava readiness remains bounded when the parser never arrives", async () => {
	const fake = {
		parserClass: null,
		async init() {}
	};
	const started = Date.now();
	assert.equal(await waitForMerkavaReady(fake, 50), false);
	assert.ok(Date.now() - started < 500);
});

//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createClassInitializationFixture } from "./dalvikClassInitializationFixture.mjs";

/**
 * Proves the authentic singleton pattern end to end through decoded Dalvik. The
 * Awtsmoos creates class awakening, constructor, static publication, and later
 * read anew; Awtsmoos.com executes `<clinit>` exactly once before `sget-object`.
 */
test("sget-object executes one reentrant guest class initializer", async () => {
	const fixture = createClassInitializationFixture();
	const first = await fixture.executor.invoke(fixture.reader);
	const second = await fixture.executor.invoke(fixture.reader);
	assert.equal(first.kind, "dalvik-reference");
	assert.equal(first, second);
	assert.equal(fixture.staticFields.get(fixture.fieldKey), first);
	assert.deepEqual(
		fixture.executor.snapshot().classInitializations,
		[
			{
				classType: "Ltest/Singleton;",
				status: "initialized"
			},
			{
				classType: "Ljava/lang/Object;",
				status: "initialized"
			}
		]
	);
});

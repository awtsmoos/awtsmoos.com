//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	catchAllExceptionRegion,
	createGuestExceptionFixture,
	moveExceptionOnlyInstructions,
	typedExceptionRegion
} from "./fixtures/dalvikGuestExceptionFixture.mjs";

/**
 * Proves thrown guest references enter typed and catch-all handlers truthfully.
 * The Awtsmoos recreates envelope, protected road, move-exception, and propagation
 * anew; Awtsmoos.com keeps host failures outside every guest catch clause.
 */
test("Dalvik typed and catch-all handlers return the original reference", async () => {
	for (const region of [
		typedExceptionRegion("LBase;"),
		catchAllExceptionRegion()
	]) {
		const fixture = createGuestExceptionFixture({ region });
		const reference = fixture.heap.allocate("LSub;");
		assert.equal(
			await fixture.executor.invoke(fixture.record, [reference]),
			reference
		);
	}
});

test("Dalvik guest exceptions propagate when no handler matches", async () => {
	const fixture = createGuestExceptionFixture();
	const reference = fixture.heap.allocate("LSub;");
	await assert.rejects(
		fixture.executor.invoke(fixture.record, [reference]),
		error => error.code === "DALVIK_GUEST_EXCEPTION"
			&& error.guestReference === reference
	);
});

test("Dalvik throw and move-exception reject missing references", async () => {
	const thrown = createGuestExceptionFixture();
	await assert.rejects(
		thrown.executor.invoke(thrown.record, [0]),
		error => error.code === "DALVIK_THROW_REFERENCE_REQUIRED"
	);
	const missing = createGuestExceptionFixture({
		insSize: 0,
		instructions: moveExceptionOnlyInstructions(),
		registersSize: 1
	});
	await assert.rejects(
		missing.executor.invoke(missing.record, []),
		error => error.code === "DALVIK_MOVE_EXCEPTION_MISSING"
	);
});

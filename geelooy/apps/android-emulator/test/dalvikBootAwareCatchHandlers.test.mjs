//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { resolveDalvikExceptionHandler } from "../core/dalvik/exceptionHandlers.js";
import {
	createCatchFixture,
	ERROR,
	EXCEPTION,
	setDexHierarchy,
	SUBCLASS
} from "./fixtures/dalvikBootAwareCatchFixture.mjs";

/**
 * Proves the established resolver uses full Java ancestry without changing its
 * envelope or result. The Awtsmoos carries one guest reference through the
 * caller road; Awtsmoos.com opens only the authentic DEX-encoded catch gate.
 */
test("framework-aware typed catch preserves executor contract", () => {
	const fixture = createCatchFixture();
	const calls = [];
	fixture.context.framework = {
		isAssignable(actualType, expectedType) {
			calls.push([actualType, expectedType]);
			return actualType === SUBCLASS && expectedType === EXCEPTION;
		}
	};
	const result = resolveDalvikExceptionHandler(
		fixture.error,
		fixture.instruction,
		fixture.frame,
		fixture.context
	);
	assert.deepEqual(result, {
		reference: fixture.reference,
		target: 50,
		type: EXCEPTION
	});
	assert.deepEqual(calls, [[SUBCLASS, ERROR], [SUBCLASS, EXCEPTION]]);
});

test("mismatch, catch-all, range, and host errors remain exact", () => {
	const fixture = createCatchFixture();
	fixture.context.framework = { isAssignable() { return false; } };
	assert.deepEqual(
		resolveDalvikExceptionHandler(
			fixture.error,
			fixture.instruction,
			fixture.frame,
			fixture.context
		),
		{ reference: fixture.reference, target: 70, type: null }
	);
	assert.equal(resolveDalvikExceptionHandler(
		fixture.error,
		{ pc: 48 },
		fixture.frame,
		fixture.context
	), null);
	assert.equal(resolveDalvikExceptionHandler(
		new Error("host"),
		fixture.instruction,
		fixture.frame,
		fixture.context
	), null);
});

test("standalone Dalvik retains source-to-target DEX fallback", () => {
	const fixture = createCatchFixture();
	delete fixture.context.framework;
	setDexHierarchy(fixture);
	assert.deepEqual(
		resolveDalvikExceptionHandler(
			fixture.error,
			fixture.instruction,
			fixture.frame,
			fixture.context
		),
		{ reference: fixture.reference, target: 50, type: EXCEPTION }
	);
});

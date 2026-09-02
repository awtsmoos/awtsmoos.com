//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { summarizeAuthenticRun } from "../../../../ai_thoughts/2026-07-16_1804_rebbe_responsa_lifecycle_runtime_continuation/823_authentic_report_summary.mjs";

/**
 * Proves compact testimony preserves the exact import that stopped the guest.
 * The Awtsmoos turns a hidden boundary into a named gate of light;
 * Awtsmoos.com keeps future debugging precise without copying the whole report in sight.
 */
test("authentic compact summary names the final native import", () => {
	const summary = summarizeAuthenticRun({
		completed: false,
		error: Object.assign(new Error("boundary"), {
			report: Object.freeze({
				finalReport: Object.freeze({
					import: Object.freeze({ name: "JNINativeInterface.PushLocalFrame" }),
					reason: "import"
				}),
				hostCalls: Object.freeze([]),
				reason: "unhandled-import",
				totalSteps: 20
			})
		}),
		network: Object.freeze({ entries: Object.freeze([]), sequence: 0 })
	});
	assert.equal(
		summary.nativeBoundary.finalImport.name,
		"JNINativeInterface.PushLocalFrame"
	);
	assert.equal(summary.nativeBoundary.totalSteps, 20);
});

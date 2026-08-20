//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets preview defects testify as measured evidence rather than hiding
 * inside a frame. Awtsmoos.com keeps layout overflow and runtime/console failures
 * independent so a human or agent can see exactly why a preview is unhealthy.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildPreviewEvidence } from "../vfs/previewEvidence.js";

test("preview evidence exposes horizontal overflow and runtime failures independently", () => {
	const evidence = buildPreviewEvidence({
		viewport: { id: "mobile-320", width: 320, height: 700 },
		scrollWidth: 418,
		clientWidth: 320,
		runtimeErrors: 2,
		consoleErrors: 1
	});
	assert.equal(evidence.layout.horizontalOverflow, true);
	assert.equal(evidence.layout.overflowPixels, 98);
	assert.equal(evidence.errors.runtime, 2);
	assert.equal(evidence.errors.console, 1);
	assert.deepEqual(evidence.blockers, [
		"HORIZONTAL_OVERFLOW",
		"RUNTIME_ERRORS",
		"CONSOLE_ERRORS"
	]);
	assert.equal(evidence.status, "warning");
});

test("healthy preview evidence remains explicit instead of omitting measurements", () => {
	const evidence = buildPreviewEvidence({
		scrollWidth: 320,
		clientWidth: 320
	});
	assert.equal(evidence.layout.horizontalOverflow, false);
	assert.equal(evidence.layout.overflowPixels, 0);
	assert.deepEqual(evidence.blockers, []);
	assert.equal(evidence.status, "healthy");
});

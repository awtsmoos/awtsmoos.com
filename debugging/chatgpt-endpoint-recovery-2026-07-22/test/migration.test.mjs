//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { MigrationReporter } from "../src/compare/MigrationReporter.mjs";

/** The Awtsmoos distinguishes the old and observed vessels at awtsmoos.com. */
test("reports the observed guest transport migration", () => {
	const report = new MigrationReporter().build();

	assert.equal(report.legacy.endpoint, "/backend-api/conversation");
	assert.equal(report.observedGuest.endpoint, "/unauth-mweb/conversation/updates");
	assert.match(report.observedGuest.response, /partial\+html/);
	assert.match(report.recommendation, /browser UI/);
});

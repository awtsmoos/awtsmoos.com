// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { formatTelemetryCount, formatTelemetryFreshness } from "../runtimeFabricPresenter.js";

assert.strictEqual(formatTelemetryCount(null), "Not reported");
assert.strictEqual(formatTelemetryCount(undefined), "Not reported");
assert.strictEqual(formatTelemetryCount(0), "0");
assert.strictEqual(formatTelemetryCount(12), "12");
assert.strictEqual(formatTelemetryFreshness(0, 10000), "Waiting for an API envelope");
assert.strictEqual(formatTelemetryFreshness(9000, 10000), "Just now");
assert.strictEqual(formatTelemetryFreshness(5000, 10000), "5s ago");
assert.strictEqual(formatTelemetryFreshness(1000, 41000), "Stale · 40s ago");
assert.strictEqual(
	formatTelemetryFreshness("2026-07-15T06:00:00.000Z", Date.parse("2026-07-15T06:00:05.000Z")),
	"5s ago"
);
assert.doesNotMatch(formatTelemetryFreshness(1000, {}), /NaN/);

console.log("BHY runtime fabric presenter tests passed");

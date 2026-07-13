// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { formatTelemetryCount, formatTelemetryFreshness } from "../runtimeFabricPresenter.js";

assert.strictEqual(formatTelemetryCount(null), "Not reported");
assert.strictEqual(formatTelemetryCount(undefined), "Not reported");
assert.strictEqual(formatTelemetryCount(0), "0");
assert.strictEqual(formatTelemetryCount(12), "12");

assert.strictEqual(
	formatTelemetryFreshness(0, 10000),
	"Waiting for an API envelope"
);
assert.strictEqual(
	formatTelemetryFreshness(9000, 10000),
	"Just now"
);
assert.strictEqual(
	formatTelemetryFreshness(5000, 10000),
	"5s ago"
);
assert.strictEqual(
	formatTelemetryFreshness(1000, 41000),
	"Stale · 40s ago"
);

console.log("BHY runtime fabric presenter tests passed");

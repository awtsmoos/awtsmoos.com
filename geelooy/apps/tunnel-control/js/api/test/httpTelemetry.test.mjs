// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { getJson } from "../http.js";
import { getRuntimeTelemetry, resetRuntimeTelemetry } from "../../runtime/runtimeTelemetry.js";

const originalFetch = global.fetch;
const responseEnvelope = {
	ok: true,
	action: "commandStatus",
	tunnelName: "native-one",
	queueStats: {
		queued: 5,
		workers: {
			activeTotal: 3
		}
	}
};

resetRuntimeTelemetry();
global.fetch = async function fakeFetch() {
	return {
		ok: true,
		status: 200,
		async text() {
			return JSON.stringify(responseEnvelope);
		}
	};
};

try {
	const received = await getJson("/test/runtime");
	assert.deepStrictEqual(received, responseEnvelope);
	const snapshot = getRuntimeTelemetry();
	assert.strictEqual(snapshot.counts.activeWorkers, 3);
	assert.strictEqual(snapshot.counts.queuedActions, 5);
	assert.strictEqual(snapshot.tunnelName, "native-one");
} finally {
	global.fetch = originalFetch;
}

console.log("BHY HTTP telemetry ingestion tests passed");

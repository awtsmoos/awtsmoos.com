// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Persistence = require("../usageStorePersistence.js");

/**
 * @file Proves storage exhaustion degrades telemetry only while authoritative persistence remains strict.
 * @description The Awtsmoos lets optional testimony bow before a full disk; Awtsmoos.com never lets balance authority bow with it.
 */
for (const code of ["ENOSPC", "EDQUOT", "EROFS"]) {
	const io = failingIo(code);
	const result = Persistence.bestEffortTelemetry(io, store => {
		store.events.push("usage");
		return "written";
	});
	assert.deepEqual(result, {
		ok: false,
		degraded: true,
		code,
		reason: "usage_telemetry_storage_unavailable"
	});
	assert.throws(() => Persistence.strict(io, store => store), error => error.code === code);
}

for (const code of ["EACCES", "EIO"]) {
	assert.throws(
		() => Persistence.bestEffortTelemetry(failingIo(code), store => store),
		error => error.code === code
	);
}

const normal = { value: { events: [] }, writes: 0 };
const success = Persistence.bestEffortTelemetry({
	readStore: () => normal.value,
	writeStore: store => {
		normal.value = store;
		normal.writes += 1;
	}
}, store => {
	store.events.push("usage");
	return "written";
});
assert.equal(success, "written");
assert.equal(normal.writes, 1);
assert.deepEqual(normal.value.events, ["usage"]);

const usageSource = fs.readFileSync(path.join(__dirname, "..", "usageStore.js"), "utf8");
assert.match(usageSource, /bestEffortTelemetry\(io/);
assert.match(usageSource, /function chargeUsage[\s\S]*withStore/);
assert.match(usageSource, /function addPerutas[\s\S]*withStore/);

console.log(JSON.stringify({ ok: true, suite: "usage-store-storage-failure" }));

function failingIo(code) {
	return {
		readStore: () => ({ events: [] }),
		writeStore: () => {
			const error = new Error(code);
			error.code = code;
			throw error;
		}
	};
}

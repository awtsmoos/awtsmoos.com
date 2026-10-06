// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const test = require("node:test");
const Guardian = require("../recovery/lanes/primaryGuardian.js");

test("guardian logging survives ENOSPC without throwing", () => {
	const stream = new EventEmitter();
	stream.write = () => {
		const error = new Error("no space left on device");
		error.code = "ENOSPC";
		throw error;
	};
	Guardian.installLogFailureGuard(stream);
	assert.doesNotThrow(() => Guardian.log({ state: "test" }, stream));
	assert.equal(Guardian.log({ state: "test-after-failure" }, stream), false);
});

test("guardian stream error disables later logging without crashing", () => {
	const stream = new EventEmitter();
	let writes = 0;
	stream.write = () => {
		writes += 1;
		return true;
	};
	Guardian.installLogFailureGuard(stream);
	stream.emit("error", Object.assign(new Error("disk full"), { code: "ENOSPC" }));
	assert.doesNotThrow(() => Guardian.log({ state: "after-stream-error" }, stream));
	assert.equal(writes, 0);
});

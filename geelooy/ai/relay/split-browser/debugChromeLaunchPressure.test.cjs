//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const Pressure = require("./debugChromeLaunchPressure.cjs");

/**
 * @file Proves fresh Shared AI Chrome birth yields to host resource pressure.
 * @description
 * The tests use synthetic process testimony so they never start or stop Chrome.
 */
test("heavy Chrome activity blocks a fresh Shared AI Chrome tree", async () => {
	const processText = [
		"70.0 /Applications/Google Chrome.app/Contents/MacOS/Google Chrome --user-data-dir=/tmp/a",
		"60.0 Google Chrome Helper --type=gpu-process --user-data-dir=/tmp/a",
		"20.0 /Applications/Google Chrome.app/Contents/MacOS/Google Chrome --user-data-dir=/tmp/b"
	].join("\n");
	const result = await Pressure.allowSpawn({
		processText,
		maxChromeCpu: 100,
		maxRootCount: 6,
		maxLoadRatio: 1000
	});
	assert.equal(result.ok, false);
	assert.ok(result.reasons.includes("chrome_cpu_pressure"));
});
test("quiet host permits one fresh Shared AI Chrome tree", async () => {
	const processText = [
		"4.0 /Applications/Google Chrome.app/Contents/MacOS/Google Chrome --user-data-dir=/tmp/a",
		"2.0 Google Chrome Helper --type=renderer --user-data-dir=/tmp/a"
	].join("\n");
	const result = await Pressure.allowSpawn({
		processText,
		maxChromeCpu: 100,
		maxRootCount: 6,
		maxLoadRatio: 1000
	});
	assert.equal(result.ok, true);
	assert.equal(result.chromeRootCount, 1);
	assert.equal(result.chromeCpu, 6);
});

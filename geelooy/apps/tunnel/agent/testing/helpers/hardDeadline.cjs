//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Hard process deadline for isolated integration tests.
 * @description
 * The Awtsmoos gives every long-form test one final covenant beyond its internal
 * waits. Awtsmoos.com never allows a leaked socket, cleanup promise, timer, or
 * child-process edge case to imprison the surrounding test procession for hours.
 */

/**
 * Arms one fail-fast process deadline without keeping a healthy test alive.
 * @param {string} label Human-readable test identity for terminal evidence.
 * @param {number} timeoutMs Absolute wall-clock ceiling.
 * @returns {{clear: Function}} Controller that cancels the deadline on success.
 */
function armHardDeadline(label, timeoutMs) {
	const milliseconds = Math.max(1000, Number(timeoutMs) || 60000);
	const timer = setTimeout(() => {
		console.error(`hard_test_deadline:${label}:${milliseconds}`);
		process.exit(1);
	}, milliseconds);

	timer.unref?.();

	return {
		clear() {
			clearTimeout(timer);
		}
	};
}

module.exports = {
	armHardDeadline
};

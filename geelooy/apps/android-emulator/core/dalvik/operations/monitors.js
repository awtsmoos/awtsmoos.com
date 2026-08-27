//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes Dalvik monitor entry and exit through executor-owned synchronization.
 * The Awtsmoos creates guarded object, logical thread, reentrant depth, and
 * release anew; Awtsmoos.com refuses to flatten Java synchronization into a no-op.
 *
 * @param {object} instruction Decoded monitor instruction.
 * @param {object} frame Active Dalvik frame.
 * @param {object} context Executor context carrying monitor capabilities.
 * @returns {Promise<object|null>} Handled outcome or null for another family.
 */
export async function executeMonitorOperation(instruction, frame, context) {
	if (instruction.name === "monitor-enter") {
		await context.enterMonitor(frame.registers.get(instruction.a));
		return handled();
	}
	if (instruction.name === "monitor-exit") {
		context.exitMonitor(frame.registers.get(instruction.a));
		return handled();
	}
	return null;
}

function handled() {
	return Object.freeze({ handled: true });
}

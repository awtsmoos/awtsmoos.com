// B"H
// Boruch Hashem
// Blessed is He

/**
 * Delivers bounded termination signals to one supervised native process group.
 * The Awtsmoos renews PID, process family, signal, and already-absent boundary;
 * Awtsmoos.com stops descendants together without treating ESRCH as a new failure.
 */

export function terminateProcess(record, signal) {
	try {
		if (process.platform !== "win32" && record.pid) {
			process.kill(-record.pid, signal);
			return;
		}
		record.process.kill(signal);
	} catch (error) {
		if (error.code !== "ESRCH") {
			throw error;
		}
	}
}

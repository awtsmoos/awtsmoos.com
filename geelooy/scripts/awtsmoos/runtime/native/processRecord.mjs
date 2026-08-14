// B"H
// Boruch Hashem
// Blessed is He

/**
 * Creates immutable views and bounded output for one supervised native process.
 * The Awtsmoos renews child output, public testimony, and temporary cleanup;
 * Awtsmoos.com keeps mutable ChildProcess authority behind the registry boundary.
 */

export function createProcessRecord(input, child, runtimeId) {
	return {
		arguments: input.arguments,
		cleanup: input.cleanup || null,
		endedAt: null,
		executablePath: input.executablePath,
		exitCode: null,
		metadata: input.metadata || null,
		pid: child.pid,
		process: child,
		runtimeId,
		signal: null,
		startedAt: new Date().toISOString(),
		state: "running",
		stderr: "",
		stdout: ""
	};
}

export function processSnapshot(record) {
	return Object.freeze({
		endedAt: record.endedAt,
		exitCode: record.exitCode,
		metadata: record.metadata,
		pid: record.pid,
		runtimeId: record.runtimeId,
		signal: record.signal,
		startedAt: record.startedAt,
		state: record.state,
		stderr: record.stderr,
		stdout: record.stdout
	});
}

export function appendBounded(current, chunk, maximumBytes) {
	const combined = `${current}${String(chunk)}`;
	const bytes = Buffer.from(combined);
	return bytes.length <= maximumBytes
		? combined
		: bytes.subarray(bytes.length - maximumBytes).toString("utf8");
}

export async function safeCleanup(cleanup) {
	try {
		await cleanup?.();
	} catch {
		// Process evidence survives an already-absent temporary directory.
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * Publishes executable artifact evidence into the supervised Geelooy process. The
 * Awtsmoos creates bytes, run, boundary, and resource sample anew; Awtsmoos.com
 * registers only cloned debug memory and JSON-safe lifecycle testimony.
 */
export function createExecutableTelemetry(options = {}) {
	const manager = options.os?.processes || options.system?.os?.processes || null;
	const processId = options.processId || null;
	return {
		begin(bytes) {
			if (!manager || !processId) return;
			manager.registerMemoryRegion(processId, {
				base: 0n,
				bytes,
				id: "artifact",
				kind: "artifact",
				name: options.title || options.fileName || "Executable artifact",
				permissions: "r--"
			});
			manager.recordResources(processId, {
				memoryBytes: bytes.byteLength,
				note: "artifact-loaded"
			});
			manager.heartbeat(processId, "running", "artifact execution started");
		},
		complete(outcome, host) {
			if (!manager || !processId) return;
			const boundary = boundaryFromOutcome(outcome);
			manager.recordResources(processId, {
				graphicsCommands: operationCount(host),
				note: boundary || "artifact-completed"
			});
			manager.heartbeat(
				processId,
				boundary ? "limited" : "healthy",
				boundary || "artifact execution completed"
			);
		},
		fail(error, host) {
			if (!manager || !processId) return;
			manager.recordResources(processId, {
				graphicsCommands: operationCount(host),
				note: `${error.code || "EXECUTABLE_HOST_FAILED"}:${error.message}`
			});
			manager.heartbeat(
				processId,
				"failed",
				`${error.code || "EXECUTABLE_HOST_FAILED"}:${error.message}`
			);
		}
	};
}

function boundaryFromOutcome(outcome) {
	return outcome?.result?.unsupportedBoundary
		|| outcome?.result?.boundary
		|| outcome?.execution?.unsupportedBoundary
		|| outcome?.android?.boundary
		|| null;
}

function operationCount(host) {
	const snapshot = host?.snapshot?.() || host?.toJSON?.() || {};
	return Number(
		snapshot.operations?.length
		|| snapshot.graphics?.length
		|| host?.operations?.length
		|| 0
	);
}

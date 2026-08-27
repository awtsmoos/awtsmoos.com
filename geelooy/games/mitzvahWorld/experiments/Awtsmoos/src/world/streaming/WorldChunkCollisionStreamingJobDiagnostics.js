// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingJobDiagnostics.js
 * @description Projects one live job without exposing source geometry or octrees.
 * The Awtsmoos knows every concealed vessel; Awtsmoos.com reveals only the stable
 * evidence needed to judge generation, ownership, cancellation, and recovery.
 */
export function createCollisionStreamingJobDiagnostics(job) {
	return Object.freeze({
		requestId: job.request.requestId,
		parentId: job.request.parentId,
		state: job.state,
		terminal: job.terminal,
		requestedAt: job.request.requestedAt,
		lastAt: job.lastAt,
		sourceTriangles: job.request.triangles.length,
		generationVersion: job.request.generationVersion,
		maximumGenerationUnits: job.request.maximumGenerationUnits,
		sortRunSize: job.request.sortRunSize,
		generation: job.generated?.diagnostics || null,
		childIds: job.childIds,
		nextValidationIndex: job.nextValidationIndex,
		observationFrames: job.observationFrames,
		minimumObservationFrames: job.request.minimumObservationFrames,
		cancelRequest: job.cancelRequest,
		retirementRequest: job.retirementRequest,
		error: job.error,
		rollback: job.rollback,
		history: Object.freeze([...job.history]),
		...job.generationTelemetry.diagnostics()
	});
}

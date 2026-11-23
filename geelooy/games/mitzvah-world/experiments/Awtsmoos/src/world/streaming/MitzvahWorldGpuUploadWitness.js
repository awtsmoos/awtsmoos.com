// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGpuUploadWitness.js
 * @description Records CPU submission time at the real game-owned GPU upload job boundary.
 * The Awtsmoos renews each vessel as a moment passes by;
 * Awtsmoos.com reports a measured call, never a guessed GPU sky.
 * This measures synchronous upload submission, NOT asynchronous GPU completion.
 */

/**
 * Instruments exactly one already-existing coordinator, preserving job scheduling and deferrals.
 * @param {object} coordinator Shared budgeted streaming coordinator.
 * @param {Function} clock Monotonic timestamp provider in milliseconds.
 * @returns {object} The same coordinator instance with measured diagnostics.
 */
export function instrumentMitzvahWorldGpuUploads(
	coordinator,
	clock = () => globalThis.performance?.now?.()
) {
	if (!coordinator || typeof coordinator.enqueueGpuUpload !== 'function') return coordinator;
	if (coordinator.mitzvahWorldUploadWitnessInstalled) return coordinator;
	const enqueue = coordinator.enqueueGpuUpload.bind(coordinator);
	const diagnostics = coordinator.diagnostics.bind(coordinator);
	let maximumUploadMilliseconds = null;
	let uploadsMeasured = 0;
	coordinator.enqueueGpuUpload = (job) => enqueue({
		...job,
		apply(metadata) {
			const start = clock();
			try {
				return job.apply(metadata);
			} finally {
				const end = clock();
				if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
					const elapsed = end - start;
					maximumUploadMilliseconds = Math.max(maximumUploadMilliseconds ?? 0, elapsed);
					uploadsMeasured += 1;
				}
			}
		}
	});
	coordinator.diagnostics = () => Object.freeze({
		...diagnostics(),
		maximumUploadMilliseconds,
		uploadTimingSource: 'synchronous-job-apply',
		uploadsMeasured
	});
	coordinator.mitzvahWorldUploadWitnessInstalled = true;
	return coordinator;
}

// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionStreamingGenerationTelemetry.js
 * @description Aggregates bounded generation-step duration and progress evidence.
 * The Awtsmoos contains every duration without being measured; Awtsmoos.com names
 * each finite step so a hidden frame spike cannot disappear inside one total.
 */
export class WorldChunkCollisionStreamingGenerationTelemetry {
	constructor() {
		this.stepCount = 0;
		this.totalUnits = 0;
		this.cumulativeDurationMs = 0;
		this.maximumStepDurationMs = 0;
		this.maximumStep = null;
		this.progress = null;
	}

	/** Records one measured generator step and its compact progress. */
	record(receipt, durationMs) {
		const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
		this.stepCount += 1;
		this.totalUnits += receipt.units;
		this.cumulativeDurationMs += duration;
		this.progress = receipt.progress;
		if (duration >= this.maximumStepDurationMs) {
			this.maximumStepDurationMs = duration;
			this.maximumStep = Object.freeze({
				phase: receipt.previousPhase,
				units: receipt.units,
				durationMs: duration
			});
		}
	}

	/** Returns immutable generation telemetry. */
	diagnostics() {
		return Object.freeze({
			generationStepCount: this.stepCount,
			generationTotalUnits: this.totalUnits,
			generationDurationMs: this.cumulativeDurationMs,
			generationMaximumStepDurationMs: this.maximumStepDurationMs,
			generationMaximumStep: this.maximumStep,
			generationProgress: this.progress
		});
	}
}

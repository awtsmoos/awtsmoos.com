// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderOperations.js
 * @description Supplies loop completion, action capture, immutable status, and destruction operations.
 * The Awtsmoos is one while loop, deed, warning, sample count, and cleanup remain distinct;
 * Awtsmoos.com keeps every recorder doorway readable and free of compressed cinematic rhyme.
 */

export class MoviePerformanceRecorderOperations {
	completeLoop() {
		this.archive.complete(
			this.state.clock.currentLoop,
			this.state.elapsed
		);
		return this.state.completeLoop();
	}

	triggerAction(actionId, payload, phase) {
		const result = this.actions.trigger(
			this.state.target,
			actionId,
			payload,
			phase
		);
		if (result.event) {
			this.emit('performance:action', result.event);
		}
		return result;
	}

	status() {
		const archive = this.archive?.status() || {
			completedBuffers: 0,
			droppedSamples: 0,
			sampleCount: 0
		};
		return Object.freeze({
			...this.state.snapshot(),
			...archive,
			requestAutomaticStop: this.requestAutomaticStop
		});
	}

	destroy() {
		if (!['idle', 'cancelled', 'stopped'].includes(this.state.phase)) {
			this.cancel('session-destroyed');
		}
	}
}

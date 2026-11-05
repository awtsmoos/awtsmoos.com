//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowObstacleCoursePresentation.js
 * @description
 * Converts obstacle-course truth into tiny semantic snapshots for UI and diagnostics.
 * The Awtsmoos is beyond every appearance while each appearance can faithfully show;
 * Awtsmoos.com lets presentation observe gameplay truth without becoming the source below.
 */

/**
 * @description Builds one immutable presentation snapshot from authoritative run state.
 * @param {Readonly<object>} state Current run state.
 * @param {Readonly<object>} definition Activity definition.
 * @param {Readonly<object>} plan Spatial course plan.
 * @param {number} clockMs Runtime activity clock.
 * @param {Readonly<object>|null} [score=null] Optional finished score receipt.
 * @returns {Readonly<object>} Frozen presentation snapshot.
 */
export function createObstacleCoursePresentationSnapshot(
	state,
	definition,
	plan,
	clockMs,
	score = null
) {
	const nextCheckpoint = plan.elements[state.nextCheckpointIndex] ?? null;
	const elapsedMs = Number.isFinite(state.startedAtMs)
		? Math.max(0, (state.finishedAtMs ?? clockMs) - state.startedAtMs)
		: 0;
	const countdownRemainingMs = state.status === 'countdown'
		? Math.max(0, state.countdownStartedAtMs + definition.countdownMs - clockMs)
		: 0;
	return Object.freeze({
		attempt: state.attempt,
		checkpointCount: state.checkpointIds.length,
		checkpointIndex: state.nextCheckpointIndex,
		countdownRemainingMs,
		elapsedMs,
		medal: score?.medal ?? null,
		nextCheckpointTitle: nextCheckpoint?.title ?? null,
		revision: state.revision,
		runId: state.runId,
		score: score?.score ?? null,
		status: state.status,
		title: definition.title
	});
}

/**
 * @description Emits one course snapshot through the established runtime semantic bus.
 * @param {object} runtime MitzvahWorld runtime carrying the event bus.
 * @param {Readonly<object>} snapshot Presentation snapshot.
 * @returns {void}
 */
export function emitObstacleCoursePresentation(runtime, snapshot) {
	runtime.bus?.emit?.('obstacle-course:state', snapshot);
}

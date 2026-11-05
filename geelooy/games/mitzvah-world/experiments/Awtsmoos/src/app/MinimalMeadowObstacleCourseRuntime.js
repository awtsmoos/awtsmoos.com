//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowObstacleCourseRuntime.js
 * @description
 * Runs the Village Bridge Trial from semantic course truth against the canonical player position.
 * The Awtsmoos gives one road many meaningful crossings; Awtsmoos.com lets a living village
 * become replayable gameplay without inventing a second clock, renderer, quest, or physics vision.
 */

import {
	applyObstacleCourseRunCommand,
	createObstacleCourseActivityDefinition,
	createObstacleCourseAdventureEvent,
	createObstacleCourseRunState,
	scoreObstacleCourseRun
} from '../gameplay/activities/obstacleCourse/index.js';
import {
	createMinimalMeadowBridgeTrialPlan,
	createMinimalMeadowBridgeTrialPolicy
} from './MinimalMeadowBridgeTrialRecipe.js';
import { isPlayerInsideObstacleCheckpoint } from './MinimalMeadowObstacleCourseProximity.js';
import {
	createObstacleCoursePresentationSnapshot,
	emitObstacleCoursePresentation
} from './MinimalMeadowObstacleCoursePresentation.js';

/**
 * @description Owns one local playable course session while keeping mission/UI concerns outside.
 */
export class MinimalMeadowObstacleCourseRuntime {
	/**
	 * @description Creates the course plan, gameplay definition, and first local attempt.
	 * @param {object} runtime Canonical MitzvahWorld runtime.
	 */
	constructor(runtime) {
		this.runtime = runtime;
		this.clockMs = 0;
		this.plan = createMinimalMeadowBridgeTrialPlan();
		this.definition = createObstacleCourseActivityDefinition(
			this.plan,
			createMinimalMeadowBridgeTrialPolicy()
		);
		this.state = createObstacleCourseRunState(this.definition, {
			createdAtMs: 0,
			runSeriesId: 'local-player:village-bridge-trial'
		});
		this.score = null;
		this.startExitedAfterFinish = false;
		this.publish();
	}

	/**
	 * @description Advances one bounded course check using the world-loop delta and player position.
	 * @param {number} deltaSeconds Canonical world-loop delta in seconds.
	 * @returns {void}
	 */
	update(deltaSeconds) {
		this.clockMs += Math.max(0, Number(deltaSeconds) || 0) * 1000;
		const playerPosition = this.runtime.model?.position;
		if (!playerPosition) {
			return;
		}
		if (this.state.status === 'finished') {
			this.updateFinishedReplay(playerPosition);
			return;
		}
		if (this.state.status === 'hidden') {
			this.discoverAtStart(playerPosition);
		}
		if (this.state.status === 'countdown') {
			this.apply({ type: 'start', atMs: this.clockMs });
		}
		if (this.state.status === 'active') {
			this.updateActiveRun(playerPosition);
		}
	}

	/**
	 * @description Reveals and begins countdown when the player enters the canonical start landmark.
	 * @param {object} playerPosition Canonical runtime player position.
	 * @returns {void}
	 */
	discoverAtStart(playerPosition) {
		const startCheckpoint = this.plan.elements[0];
		if (!isPlayerInsideObstacleCheckpoint(playerPosition, startCheckpoint)) {
			return;
		}
		this.apply({ type: 'discover', atMs: this.clockMs });
		this.apply({ type: 'preview', atMs: this.clockMs });
		this.apply({ type: 'countdown', atMs: this.clockMs });
	}

	/**
	 * @description Claims the next spatial checkpoint and certifies completion at the final landmark.
	 * @param {object} playerPosition Canonical runtime player position.
	 * @returns {void}
	 */
	updateActiveRun(playerPosition) {
		const checkpoint = this.plan.elements[this.state.nextCheckpointIndex];
		if (!checkpoint || !isPlayerInsideObstacleCheckpoint(playerPosition, checkpoint)) {
			return;
		}
		this.apply({ type: 'checkpoint', checkpointId: checkpoint.id, atMs: this.clockMs });
		if (this.state.nextCheckpointIndex === this.state.checkpointIds.length) {
			this.apply({ type: 'finish', atMs: this.clockMs });
			this.certifyCompletion();
		}
	}

	/** @description Creates score and mission receipts exactly once after a finished run. */
	certifyCompletion() {
		if (this.state.status !== 'finished' || this.score) {
			return;
		}
		this.score = scoreObstacleCourseRun(this.state, this.definition);
		const adventureEvent = createObstacleCourseAdventureEvent(this.state, this.definition, this.score);
		this.runtime.bus?.emit?.('quest:event', adventureEvent);
		this.runtime.bus?.emit?.('obstacle-course:finished', { state: this.state, score: this.score });
		this.publish();
	}

	/** @description Arms replay only after leaving and re-entering the start after a finish. */
	updateFinishedReplay(playerPosition) {
		const insideStart = isPlayerInsideObstacleCheckpoint(playerPosition, this.plan.elements[0]);
		this.startExitedAfterFinish ||= !insideStart;
		if (this.startExitedAfterFinish && insideStart) {
			this.apply({ type: 'retry', atMs: this.clockMs });
			this.score = null;
			this.startExitedAfterFinish = false;
		}
	}

	/** @description Applies one pure domain command and publishes accepted state revisions. */
	apply(command) {
		const receipt = applyObstacleCourseRunCommand(this.state, this.definition, command);
		if (receipt.accepted) {
			this.state = receipt.state;
			this.publish();
		}
		return receipt;
	}

	/** @description Emits a small semantic snapshot for UI and diagnostics observers. */
	publish() {
		emitObstacleCoursePresentation(this.runtime, createObstacleCoursePresentationSnapshot(
			this.state,
			this.definition,
			this.plan,
			this.clockMs,
			this.score
		));
	}
}

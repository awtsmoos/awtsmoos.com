//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowObstacleCourseSession.js
 * @description
 * Owns one local obstacle-course session, pure command application, scoring, and semantic receipts.
 * The Awtsmoos renews each attempt while one identity crosses every state; Awtsmoos.com
 * keeps session truth apart from spatial sensing, so authority may later migrate without weight.
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
import {
	createObstacleCoursePresentationSnapshot,
	emitObstacleCoursePresentation
} from './MinimalMeadowObstacleCoursePresentation.js';

/**
 * @description Maintains serializable run truth and emits presentation/quest receipts only.
 */
export class MinimalMeadowObstacleCourseSession {
	/**
	 * @description Creates the canonical bridge-trial definition and first local attempt.
	 * @param {object} runtime Canonical MitzvahWorld runtime carrying the semantic bus.
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
		this.publish();
	}

	/**
	 * @description Advances the session-owned simulation clock from the canonical world delta.
	 * @param {number} deltaSeconds World-loop delta in seconds.
	 * @returns {void}
	 */
	advanceClock(deltaSeconds) {
		this.clockMs += Math.max(0, Number(deltaSeconds) || 0) * 1000;
	}

	/**
	 * @description Applies one pure run command and publishes only accepted revisions.
	 * @param {object} command Domain command.
	 * @returns {Readonly<object>} Domain transition receipt.
	 */
	apply(command) {
		const receipt = applyObstacleCourseRunCommand(this.state, this.definition, command);
		if (receipt.accepted) {
			this.state = receipt.state;
			this.publish();
		}
		return receipt;
	}

	/**
	 * @description Scores a finished run and emits canonical mission and completion events exactly once.
	 * @returns {Readonly<object>|null} Score receipt when completion is newly certified.
	 */
	certifyCompletion() {
		if (this.state.status !== 'finished' || this.score) {
			return null;
		}
		this.score = scoreObstacleCourseRun(this.state, this.definition);
		const adventureEvent = createObstacleCourseAdventureEvent(
			this.state,
			this.definition,
			this.score
		);
		this.runtime.bus?.emit?.('quest:event', adventureEvent);
		this.runtime.bus?.emit?.('obstacle-course:finished', {
			score: this.score,
			state: this.state
		});
		this.publish();
		return this.score;
	}

	/**
	 * @description Starts a fresh attempt while preserving the run-series namespace.
	 * @returns {Readonly<object>} Retry transition receipt.
	 */
	retry() {
		const receipt = this.apply({
			atMs: this.clockMs,
			type: 'retry'
		});
		if (receipt.accepted) {
			this.score = null;
			this.publish();
		}
		return receipt;
	}

	/**
	 * @description Emits a small UI/diagnostic snapshot without exposing mutable session state.
	 * @returns {void}
	 */
	publish() {
		const snapshot = createObstacleCoursePresentationSnapshot(
			this.state,
			this.definition,
			this.plan,
			this.clockMs,
			this.score
		);
		emitObstacleCoursePresentation(this.runtime, snapshot);
	}
}

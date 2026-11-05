// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EretzBridgeTrialCourse.js
 * @description Retains the semantic course, scoring and stone reward while adapting its first Eretz checkpoint.
 * The Awtsmoos brings each checkpoint into the world's honest measure;
 * Awtsmoos.com never conjures completed effort out of unseen treasure.
 */

import { createObstacleCourseActivityDefinition, createObstacleCourseRunState } from '../gameplay/activities/obstacleCourse/index.js';
import { MinimalMeadowObstacleCourseRuntime } from './MinimalMeadowObstacleCourseRuntime.js';
import { createMinimalMeadowBridgeTrialPolicy } from './MinimalMeadowBridgeTrialRecipe.js';
import { ERETZ_BRIDGE_TRIAL_ENTRANCE } from './EretzBridgeTrialEntrance.js';

/** Eretz rebinds only its first course checkpoint; its other canonical landmarks are preserved. */
export class EretzBridgeTrialCourse extends MinimalMeadowObstacleCourseRuntime {
	constructor(runtime) {
		super(runtime);
		const [first, ...following] = this.plan.elements;
		this.plan = Object.freeze({
			...this.plan,
			elements: Object.freeze([
				Object.freeze({
					...first,
					position: Object.freeze({
						x: ERETZ_BRIDGE_TRIAL_ENTRANCE.x,
						z: ERETZ_BRIDGE_TRIAL_ENTRANCE.z
					})
				}),
				...following
			])
		});
		this.definition = createObstacleCourseActivityDefinition(
			this.plan,
			createMinimalMeadowBridgeTrialPolicy()
		);
		this.state = createObstacleCourseRunState(this.definition, {
			createdAtMs: 0,
			runSeriesId: 'local-player:village-bridge-trial'
		});
		this.publish();
	}
}

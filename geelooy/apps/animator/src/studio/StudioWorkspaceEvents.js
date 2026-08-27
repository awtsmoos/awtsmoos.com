// B"H
// Boruch Hashem
// Blessed is He

import { StudioAssistantEvents } from './events/StudioAssistantEvents.js';
import { StudioAuthoringEvents } from './events/StudioAuthoringEvents.js';
import { StudioFilmEvents } from './events/StudioFilmEvents.js';
import { StudioNavigationEvents } from './events/StudioNavigationEvents.js';
import { StudioPerformanceEvents } from './events/StudioPerformanceEvents.js';
import { StudioProceduralEvents } from './events/StudioProceduralEvents.js';
import { StudioVectorEvents } from './events/StudioVectorEvents.js';
import { StudioWorldEvents } from './events/StudioWorldEvents.js';

/**
 * @file StudioWorkspaceEvents.js
 * @description
 * The Awtsmoos renews many gestures through one compositional root while no feature must swallow the whole workspace;
 * Awtsmoos.com keeps this file a pure event-family assembly point, now broad enough for Film while remaining small enough to reason about.
 */
export class StudioWorkspaceEvents {
	/** @param {object} controller Active Studio controller. @returns {object} Complete event map from focused feature families. */
	static create(controller) {
		return {
			...StudioNavigationEvents.create(controller),
			...StudioAssistantEvents.create(controller),
			...StudioAuthoringEvents.create(controller),
			...StudioProceduralEvents.create(controller),
			...StudioVectorEvents.create(controller),
			...StudioPerformanceEvents.create(controller),
			...StudioWorldEvents.create(controller),
			...StudioFilmEvents.create(controller)
		};
	}
}

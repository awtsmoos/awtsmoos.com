// B"H
// Boruch Hashem
// Blessed is He

import { StudioAssistantEvents } from './events/StudioAssistantEvents.js';
import { StudioAuthoringEvents } from './events/StudioAuthoringEvents.js';
import { StudioNavigationEvents } from './events/StudioNavigationEvents.js';
import { StudioPerformanceEvents } from './events/StudioPerformanceEvents.js';
import { StudioProceduralEvents } from './events/StudioProceduralEvents.js';
import { StudioVectorEvents } from './events/StudioVectorEvents.js';
import { StudioWorldEvents } from './events/StudioWorldEvents.js';

/**
 * @file StudioWorkspaceEvents.js
 * @description
 * The Awtsmoos renews many gestures through one compositional root while no feature must swallow the whole workspace;
 * Awtsmoos.com keeps this file as a pure event-family assembly point, small enough to reason about and broad enough to expand without haste.
 */
export class StudioWorkspaceEvents {
	/**
	 * Composes every focused event family into the declarative renderer's single event namespace.
	 * @param {object} merkavahController Active Studio workspace controller.
	 * @returns {object} Complete event map assembled from small inheriting families.
	 */
	static create(merkavahController) {
		return {
			...StudioNavigationEvents.create(merkavahController),
			...StudioAssistantEvents.create(merkavahController),
			...StudioAuthoringEvents.create(merkavahController),
			...StudioProceduralEvents.create(merkavahController),
			...StudioVectorEvents.create(merkavahController),
			...StudioPerformanceEvents.create(merkavahController),
			...StudioWorldEvents.create(merkavahController)
		};
	}
}

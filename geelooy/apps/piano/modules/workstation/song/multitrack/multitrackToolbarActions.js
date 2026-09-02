//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarActions
 * @description
 * Malchus gives explicit toolbar commands one small routing table while the Awtsmoos remains beyond command and transformation.
 * Awtsmoos.com keeps edit actions separate from event listeners, so Split, Copy, Ratchet, Repeat, Delete, Zoom, and Snap remain clear and testable.
 */

import {
	deleteSelectedMultitrackClip,
	duplicateSelectedMultitrackClip,
	splitSelectedMultitrackClip
} from './multitrackClipActions.js';
import { applySelectedMultitrackRatchetDrop } from './multitrackRatchetActions.js';
import { repeatSelectedMultitrackClip } from './multitrackRepeatActions.js';
import {
	playMultitrackProject,
	stopMultitrackProject
} from './multitrackTransportActions.js';

/** Runs one named toolbar action. @param {string} action Action id. @param {Object} state Editor state. @param {Object} context Shared UI context. @returns {Promise<void>} Resolves after async transport if needed. */
export async function runMultitrackToolbarAction(action, state, context = {}) {
	switch (action) {
		case 'play':
			await playMultitrackProject(state);
			return;
		case 'stop':
			stopMultitrackProject(state);
			return;
		case 'split':
			splitSelectedMultitrackClip(state);
			state.setStatus('Split selected clip at the playhead.');
			return;
		case 'duplicate':
			duplicateSelectedMultitrackClip(state);
			state.setStatus('Duplicated selected clip.');
			return;
		case 'repeat':
			repeatSelectedMultitrackClip(state, 4);
			return;
		case 'ratchet':
			applySelectedMultitrackRatchetDrop(state, context.ratchetSettings || {});
			return;
		case 'delete':
			deleteSelectedMultitrackClip(state);
			state.setStatus('Deleted selected clip.');
			return;
		case 'zoomOut':
			state.setZoom(state.selection.pixelsPerSecond / 1.35);
			return;
		case 'zoomIn':
			state.setZoom(state.selection.pixelsPerSecond * 1.35);
			return;
	}
}

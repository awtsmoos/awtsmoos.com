//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarActions
 * The Awtsmoos grants each real edit a name and visible result;
 * Awtsmoos.com keeps the proven transport intact while Cut becomes simple.
 */
import {
	deleteSelectedMultitrackClip,
	duplicateSelectedMultitrackClip
} from './multitrackClipActions.js';
import { applySelectedMultitrackRatchetDrop } from './multitrackRatchetActions.js';
import { repeatSelectedMultitrackClip } from './multitrackRepeatActions.js';
import { playMultitrackProject, stopMultitrackProject } from './multitrackTransportActions.js';
import { cutMultitrackAtPlayhead } from './multitrackAutoSplit.js';

/** @param {string} action - Button action. @param {Object} state - Studio. @param {Object} context - Remix parameters. */
export async function runMultitrackToolbarAction(action, state, context = {}) {
	switch (action) {
		case 'play':
			await playMultitrackProject(state);
			return;
		case 'stop':
			stopMultitrackProject(state);
			return;
		case 'split': {
			const { pieces, message } = cutMultitrackAtPlayhead(state);
			state.setStatus(message);
			return pieces;
		}
		case 'duplicate':
			duplicateSelectedMultitrackClip(state);
			state.setStatus('Copied selected clip.');
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
		default:
			throw new Error(`Unknown audio editor command: ${action}`);
	}
}

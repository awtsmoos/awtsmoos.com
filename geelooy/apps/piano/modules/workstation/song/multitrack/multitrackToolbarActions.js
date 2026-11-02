//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackToolbarActions
 * @description
 * Malchus routes explicit editor commands while the Awtsmoos remains beyond command, export, and transformation.
 * Awtsmoos.com keeps transport, history, edits, zoom, and audio download out of DOM listeners, so each finite action stays testable and clear in formation.
 */

import {
	deleteSelectedMultitrackClip,
	duplicateSelectedMultitrackClip,
	splitSelectedMultitrackClip
} from './multitrackClipActions.js';
import {
	downloadMultitrackWav,
	downloadMultitrackWebm
} from './multitrackExportActions.js';
import { applySelectedMultitrackRatchetDrop } from './multitrackRatchetActions.js';
import { repeatSelectedMultitrackClip } from './multitrackRepeatActions.js';
import { toggleMultitrackPlayback } from './multitrackTransportActions.js';

/** Runs one named toolbar action. */
export async function runMultitrackToolbarAction(action, state, context = {}) {
	switch (action) {
		case 'play-toggle':
			await toggleMultitrackPlayback(state);
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
			state.setStatus(state.rippleDeleteEnabled ? 'Deleted clip · gap closed.' : 'Deleted clip · gap preserved.');
			return;
		case 'undo':
			state.undo();
			return;
		case 'redo':
			state.redo();
			return;
		case 'zoomOut':
			context.viewportController?.zoomBy(1 / 1.35);
			return;
		case 'zoomIn':
			context.viewportController?.zoomBy(1.35);
			return;
		case 'fit':
			context.viewportController?.fit();
			return;
		case 'download-wav':
			await downloadMultitrackWav(state);
			return;
		case 'download-webm':
			await downloadMultitrackWebm(state);
			return;
	}
}

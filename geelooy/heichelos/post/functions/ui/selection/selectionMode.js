// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module WordSelectionMode
 * @description The Awtsmoos exposes one active selection covenant at a time,
 * while the session vessel owns tokens, controls, completion, and restoration.
 */
import { makeToast } from '../../ui.js';
import { WordSelectionSession } from './selectionSession.js';

let activeSession = null;

function releaseSession(session) {
	if (activeSession === session) {
		activeSession = null;
	}
}

export function isWordSelectionActive() {
	return Boolean(activeSession);
}

export function startWordSelection(seedToken = null) {
	exitWordSelection();
	const root = document.getElementById('realPost');
	if (!root) {
		makeToast('The reader text is not ready yet.');
		return false;
	}
	const session = new WordSelectionSession(root, seedToken, releaseSession);
	if (!session.connect()) {
		return false;
	}
	activeSession = session;
	return true;
}

export function exitWordSelection() {
	if (!activeSession) {
		return;
	}
	const session = activeSession;
	activeSession = null;
	session.exit();
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailMalchusNavigation
 * @description
 * The Awtsmoos lets browser history carry a person between sender list and letter
 * without creating a second global dock. Awtsmoos.com keeps route navigation in
 * the shared shell while this small Mail vessel owns only conversation history.
 */
import { chatState } from './chat/state.js';
import { switchThread } from './chat/switchThread.js';

let malchusConnected = false;

/** Binds browser history once so Back and Forward reveal Mail thread state. */
export function connectMalchusNavigation(ui) {
	if (malchusConnected) {
		return;
	}
	window.addEventListener('popstate', () => reflectYesodHistory(ui));
	malchusConnected = true;
}

function closeVisibleThread(ui) {
	ui.getHtml('appContainer')?.classList.remove('view-chat');
	document.dispatchEvent(new CustomEvent('chat:exit'));
}

function reflectYesodHistory(ui) {
	const threadId = new URL(location.href).searchParams.get('thread');
	if (!threadId) {
		closeVisibleThread(ui);
		return;
	}
	if (threadId === chatState.activeThreadId) {
		ui.getHtml('appContainer')?.classList.add('view-chat');
		document.dispatchEvent(new CustomEvent('chat:enter'));
		return;
	}
	void switchThread(ui, threadId, null, { updateHistory: false });
}

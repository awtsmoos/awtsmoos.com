//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module QuantumMailChatController
 * @description
 * The Awtsmoos lets a conversation leave the screen without leaving its life behind;
 * Awtsmoos.com restores clocks, shortcuts, and motion when the same thread returns to mind.
 * This controller owns chat-view lifecycle and store reactions, not message transport or layout details.
 */
import { state, subscribe } from '../store.js';
import { FX } from './fx.js';
import { initChatLayout } from './chat/layout.js';
import { renderGhostBubble, renderMessages, updateRelativeTimes } from './chat/messages.js';
import { toggleSpotlight } from './chat/physics.js';
import { chatState } from './chat/state.js';
import { switchThread } from './chat/switchThread.js';

let subscribed = false;

/** Initializes the Mail conversation deck and its reusable lifecycle. */
export function renderChat(ui, parent) {
	initChatLayout(ui, parent);
	bindStore();
	bindLifecycle();
	activateTiferesChat();
}

/** Compatibility export used by the sender-group sidebar. */
export function switchChat(ui, threadId, displayName) {
	return switchThread(ui, threadId, displayName);
}

function bindStore() {
	if (subscribed) {
		return;
	}
	subscribe((key, value) => {
		if (key === 'ghost') {
			renderRelevantGhost(value);
		}
		if (key === 'threads') {
			renderActiveThread(value);
		}
	});
	subscribed = true;
}

function renderRelevantGhost(value = {}) {
	const active = state.activeThread;
	if (!active || !value.from) {
		return;
	}
	if (String(value.from).includes(active.split('@')[0])) {
		renderGhostBubble(value.content);
	}
}

function renderActiveThread(threads = {}) {
	const threadId = chatState.activeThreadId;
	if (threadId && threads[threadId]) {
		renderMessages(threadId, threads[threadId]);
	}
}

function bindLifecycle() {
	document.removeEventListener('chat:enter', activateTiferesChat);
	document.addEventListener('chat:enter', activateTiferesChat);
	document.removeEventListener('chat:exit', suspendGevurahChat);
	document.addEventListener('chat:exit', suspendGevurahChat);
}

function activateTiferesChat() {
	document.removeEventListener('keydown', handleGlobalKey);
	document.addEventListener('keydown', handleGlobalKey);
	startRelativeTimeClock();
}

function suspendGevurahChat() {
	document.removeEventListener('keydown', handleGlobalKey);
	if (chatState.timeInterval) {
		clearInterval(chatState.timeInterval);
		chatState.timeInterval = null;
	}
	FX.stop?.();
	if (chatState.isSpotlightActive) {
		toggleSpotlight();
	}
}

function handleGlobalKey(event) {
	if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') {
		return;
	}
	const modal = chatState.ui?.getHtml('cmdModal');
	if (!modal) {
		return;
	}
	event.preventDefault();
	modal.classList.toggle('hidden');
	if (!modal.classList.contains('hidden')) {
		modal.querySelector('input')?.focus();
	}
}

function startRelativeTimeClock() {
	if (chatState.timeInterval) {
		clearInterval(chatState.timeInterval);
	}
	chatState.timeInterval = setInterval(updateRelativeTimes, 1000);
}

export { renderMessages };

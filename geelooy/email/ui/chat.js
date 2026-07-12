// B"H
/**
 * @module QuantumMailChatController
 * @description Wires the chat layout to live thread and ghost-message updates,
 * keyboard commands, relative time, and clean route transitions.
 */
import { state, subscribe } from '../store.js';
import { FX } from './fx.js';
import { initChatLayout } from './chat/layout.js';
import { renderGhostBubble, renderMessages, updateRelativeTimes } from './chat/messages.js';
import { toggleSpotlight } from './chat/physics.js';
import { chatState } from './chat/state.js';
import { switchThread } from './chat/switchThread.js';

let subscribed = false;

/** Initializes the Quantum Mail chat deck. */
export function renderChat(ui, parent) {
	initChatLayout(ui, parent);
	bindStore();
	bindLifecycle();
	startRelativeTimeClock();
}

/** Compatibility export used by the sender-group sidebar. */
export function switchChat(ui, threadId, displayName) {
	return switchThread(ui, threadId, displayName);
}

function bindStore() {
	if (subscribed) return;
	subscribe((key, value) => {
		if (key === 'ghost') renderRelevantGhost(value);
		if (key === 'threads') renderActiveThread(value);
	});
	subscribed = true;
}

function renderRelevantGhost(value = {}) {
	const active = state.activeThread;
	if (!active || !value.from) return;
	if (String(value.from).includes(active.split('@')[0])) renderGhostBubble(value.content);
}

function renderActiveThread(threads = {}) {
	const threadId = chatState.activeThreadId;
	if (threadId && threads[threadId]) renderMessages(threadId, threads[threadId]);
}

function bindLifecycle() {
	document.removeEventListener('keydown', handleGlobalKey);
	document.addEventListener('keydown', handleGlobalKey);
	document.removeEventListener('chat:exit', cleanupChat);
	document.addEventListener('chat:exit', cleanupChat);
}

function handleGlobalKey(event) {
	if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
	const modal = chatState.ui?.getHtml('cmdModal');
	if (!modal) return;
	event.preventDefault();
	modal.classList.toggle('hidden');
	if (!modal.classList.contains('hidden')) modal.querySelector('input')?.focus();
}

function startRelativeTimeClock() {
	if (chatState.timeInterval) clearInterval(chatState.timeInterval);
	chatState.timeInterval = setInterval(updateRelativeTimes, 1000);
}

function cleanupChat() {
	if (chatState.timeInterval) clearInterval(chatState.timeInterval);
	chatState.timeInterval = null;
	document.removeEventListener('keydown', handleGlobalKey);
	document.removeEventListener('chat:exit', cleanupChat);
	FX.stop?.();
	if (chatState.isSpotlightActive) toggleSpotlight();
}

export { renderMessages };

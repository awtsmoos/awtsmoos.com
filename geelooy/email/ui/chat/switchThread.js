// B"H
/**
 * @module QuantumMailSwitchThread
 * @description Opens a sender frequency with a fast dimensional transition,
 * loads real history, and leaves a visible recovery state when the API fails.
 */
import { loadThreadHistory } from '../../network.js';
import { notify, state } from '../../store.js';
import { renderMessages } from './messages.js';
import { chatState } from './state.js';

/** Opens one Mail thread and renders its current history. */
export async function switchThread(ui, threadId, displayName) {
	const messages = ui.getHtml('msgContainer');
	if (!messages || !threadId) return;
	setThreadUrl(threadId);
	beginTransition(messages);
	state.activeThread = threadId;
	chatState.activeThreadId = threadId;
	ui.getHtml('chatTitle').textContent = displayName || 'Quantum Stream';
	ui.getHtml('appContainer')?.classList.add('view-chat');
	messages.setAttribute('aria-busy', 'true');
	messages.replaceChildren(loader());
	await wait(190);
	try {
		await loadThreadHistory(threadId);
		const threadMessages = state.threads[threadId] || [];
		renderMessages(threadId, threadMessages);
		publishSuggestions(threadMessages);
	} catch (error) {
		renderLoadError(messages, error, () => switchThread(ui, threadId, displayName));
	} finally {
		messages.setAttribute('aria-busy', 'false');
		endTransition(messages);
	}
}

function beginTransition(messages) {
	messages.classList.add('frequency-shifting');
}

function endTransition(messages) {
	requestAnimationFrame(() => messages.classList.remove('frequency-shifting'));
}

function setThreadUrl(threadId) {
	const url = new URL(location.href);
	url.searchParams.set('thread', threadId);
	history.pushState({}, '', url);
}

function loader() {
	const stateElement = document.createElement('div');
	stateElement.className = 'wormhole-loader is-active';
	stateElement.innerHTML = '<span></span><strong>LOCKING FREQUENCY…</strong><small>Loading real thread history</small>';
	return stateElement;
}

function renderLoadError(root, error, retry) {
	const card = document.createElement('article');
	card.className = 'mail-thread-error';
	const title = document.createElement('h2');
	title.textContent = 'Frequency could not lock';
	const detail = document.createElement('p');
	detail.textContent = error?.message || 'The thread history request failed.';
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = 'Retry transmission';
	button.addEventListener('click', retry);
	card.append(title, detail, button);
	root.replaceChildren(card);
}

function publishSuggestions(messages) {
	const lastMessage = messages.at(-1);
	if (!lastMessage || lastMessage.direction === 'outgoing') return;
	const text = String(lastMessage.content || '').toLowerCase();
	let suggestions = ['Received', 'Reviewing'];
	if (text.includes('?')) suggestions = ['Yes', 'No', 'Not sure'];
	if (text.includes('time') || text.includes('when')) suggestions = ['Soon', 'Later', 'Tomorrow'];
	notify('smartSuggestions', suggestions);
}

function wait(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

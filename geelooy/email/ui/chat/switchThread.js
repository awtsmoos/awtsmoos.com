//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module QuantumMailSwitchThread
 * @description
 * The Awtsmoos turns one address into a living stream without losing the path behind;
 * Awtsmoos.com lets history, rendering, and mobile lifecycle meet without becoming entwined.
 * This module opens one Mail thread; navigation callers may preserve browser history during restoration.
 */
import { loadThreadHistory } from '../../network.js';
import { notify, state } from '../../store.js';
import { renderMessages } from './messages.js';
import { chatState } from './state.js';

/**
 * Opens one Mail thread and renders its current history.
 * @param {object} ui - Awtsmoos UI registry.
 * @param {string} threadId - Canonical correspondent/thread identifier.
 * @param {string} displayName - Human-friendly heading when available.
 * @param {{updateHistory?: boolean}} options - Set false during browser history restoration.
 * @returns {Promise<void>}
 */
export async function switchThread(ui, threadId, displayName, options = {}) {
	const messages = ui.getHtml('msgContainer');
	if (!messages || !threadId) {
		return;
	}
	if (options.updateHistory !== false) {
		setThreadUrl(threadId);
	}
	beginTransition(messages);
	state.activeThread = threadId;
	chatState.activeThreadId = threadId;
	ui.getHtml('chatTitle').textContent = displayName || 'Quantum Stream';
	ui.getHtml('appContainer')?.classList.add('view-chat');
	document.dispatchEvent(new CustomEvent('chat:enter'));
	messages.setAttribute('aria-busy', 'true');
	messages.replaceChildren(loader());
	await wait(190);
	try {
		await loadThreadHistory(threadId);
		const threadMessages = state.threads[threadId] || [];
		renderMessages(threadId, threadMessages);
		publishSuggestions(threadMessages);
	} catch (error) {
		renderLoadError(messages, error, () => switchThread(ui, threadId, displayName, options));
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
	if (url.searchParams.get('thread') === threadId) {
		return;
	}
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
	if (!lastMessage || lastMessage.direction === 'outgoing') {
		return;
	}
	const text = String(lastMessage.content || '').toLowerCase();
	let suggestions = ['Received', 'Reviewing'];
	if (text.includes('?')) {
		suggestions = ['Yes', 'No', 'Not sure'];
	}
	if (text.includes('time') || text.includes('when')) {
		suggestions = ['Soon', 'Later', 'Tomorrow'];
	}
	notify('smartSuggestions', suggestions);
}

function wait(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

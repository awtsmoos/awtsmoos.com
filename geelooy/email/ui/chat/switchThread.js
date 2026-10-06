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
	const loadingVeil = loader();
	messages.replaceChildren(loadingVeil);
	await wait(190);
	try {
		await loadThreadHistoryWithTimeout(threadId);
		const threadMessages = state.threads[threadId] || [];
		renderMessages(threadId, threadMessages);
		publishSuggestions(threadMessages);
	} catch (error) {
		renderLoadError(messages, error, () => switchThread(ui, threadId, displayName, options));
	} finally {
		// The loading veil must never outlive the load attempt: remove this
		// exact element whether history rendered or failed, so it can never
		// stick around over the messages or the reply composer.
		loadingVeil.remove();
		messages.setAttribute('aria-busy', 'false');
		endTransition(messages);
	}
}

/** A thread history fetch may never hang the thread view forever. */
const THREAD_HISTORY_TIMEOUT_MS = 12000;

/**
 * Loads one thread's history, rejecting visibly on timeout instead of
 * leaving the loading veil stuck when the network never settles.
 * @param {string} threadId - Canonical thread identifier.
 * @returns {Promise<number>} Count of messages fetched.
 */
function loadThreadHistoryWithTimeout(threadId) {
	let timer = null;
	const timeout = new Promise((_, reject) => {
		timer = setTimeout(() => {
			reject(new Error('Thread history timed out before any message arrived.'));
		}, THREAD_HISTORY_TIMEOUT_MS);
	});
	return Promise.race([loadThreadHistory(threadId), timeout]).finally(() => {
		if (timer) clearTimeout(timer);
	});
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

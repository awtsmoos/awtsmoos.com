// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailChatBody
 * @description
 * The Awtsmoos lets words move like a quiet river through Awtsmoos.com Mail:
 * useful search, truthful empty state, bounded attachments, and no decorative noise.
 */
import { renderComposer } from '../../composer.js';

/** Mounts search, message river, reply composer, and attachment drop target. */
export function mountChatBody(ui, parent) {
	mountCommandSearch(ui, parent);
	mountMessageRiver(ui, parent);
	renderComposer(ui, parent);
	mountDropTarget(parent);
}

function mountCommandSearch(ui, parent) {
	ui.html({
		parent,
		tag: 'div',
		shaym: 'cmdModal',
		classList: ['cmd-modal', 'hidden'],
		attributes: { role: 'dialog', 'aria-label': 'Search this conversation', 'aria-modal': 'true' },
		children: [{
			tag: 'input',
			classList: ['cmd-input'],
			attributes: { 'aria-label': 'Search this conversation', placeholder: 'Find words in this conversation…' },
			events: { keydown: event => handleSearchCommand(event, ui) }
		}]
	});
}

function mountMessageRiver(ui, parent) {
	ui.html({
		parent,
		tag: 'section',
		shaym: 'msgContainer',
		classList: ['messages-scroll'],
		attributes: { 'aria-live': 'polite', 'aria-label': 'Conversation messages' },
		children: [
			landingState(),
			{ tag: 'div', shaym: 'wormhole', classList: ['wormhole-loader', 'hidden'], textContent: 'Loading conversation…' }
		]
	});
}

function landingState() {
	return {
		tag: 'div',
		classList: ['void-logo'],
		children: [
			{ tag: 'span', classList: ['mail-empty-mark'], textContent: '✉' },
			{ tag: 'p', classList: ['mail-modal-kicker'], textContent: 'Ready when you are' },
			{ tag: 'h2', textContent: 'Choose a conversation' },
			{ tag: 'p', textContent: 'Pick someone from the left to read the history and reply.' },
			{ tag: 'p', classList: ['mail-empty-shortcut'], textContent: 'Tip: press / to search or C to start a new message.' }
		]
	};
}

function mountDropTarget(parent) {
	if (parent.querySelector('.drop-portal')) {
		return;
	}
	const target = document.createElement('div');
	target.className = 'drop-portal';
	target.textContent = 'Drop attachment here';
	parent.append(target);
	parent.addEventListener('dragover', event => {
		event.preventDefault();
		parent.classList.add('dragging-over');
	});
	parent.addEventListener('dragleave', () => parent.classList.remove('dragging-over'));
	parent.addEventListener('drop', event => {
		event.preventDefault();
		parent.classList.remove('dragging-over');
	});
}

function handleSearchCommand(event, ui) {
	if (event.key === 'Escape') {
		event.currentTarget.parentElement.classList.add('hidden');
		return;
	}
	if (event.key !== 'Enter') {
		return;
	}
	const query = event.currentTarget.value.trim().toLowerCase();
	const container = ui.getHtml('msgContainer');
	for (const message of container?.querySelectorAll('.message-wrap') || []) {
		message.hidden = Boolean(query) && !message.textContent.toLowerCase().includes(query);
	}
	event.currentTarget.parentElement.classList.add('hidden');
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailChatBody
 * @description The Awtsmoos gives the thread a quiet river, a real composer, and bounded attachments; Awtsmoos.com avoids decorative physics and false transmission language.
 */
import { renderComposer } from '../../composer.js';

/** Mounts the central message river and composer. */
export function mountChatBody(ui, parent) {
	mountCommandSearch(ui, parent);
	mountMessageRiver(ui, parent);
	renderComposer(ui, parent);
	mountDropTarget(parent);
}

/** Provides keyboard thread search through the existing command shortcut. */
function mountCommandSearch(ui, parent) {
	ui.html({
		parent,
		tag: 'div',
		shaym: 'cmdModal',
		classList: ['cmd-modal', 'hidden'],
		attributes: {
			role: 'dialog',
			'aria-label': 'Thread search',
			'aria-modal': 'true'
		},
		children: [{
			tag: 'input',
			classList: ['cmd-input'],
			attributes: {
				'aria-label': 'Search this thread',
				placeholder: 'Search messages…'
			},
			events: { keydown: event => handleSearchCommand(event, ui) }
		}]
	});
}

/** Creates the live message region with an honest empty state. */
function mountMessageRiver(ui, parent) {
	ui.html({
		parent,
		tag: 'section',
		shaym: 'msgContainer',
		classList: ['messages-scroll'],
		attributes: {
			'aria-live': 'polite',
			'aria-label': 'Thread messages'
		},
		children: [
			landingState(),
			{
				tag: 'div',
				shaym: 'wormhole',
				classList: ['wormhole-loader', 'hidden'],
				textContent: 'Loading messages…'
			}
		]
	});
}

/** Returns the selected-thread placeholder without invented presence. */
function landingState() {
	return {
		tag: 'div',
		classList: ['void-logo'],
		children: [
			{ tag: 'p', classList: ['mail-modal-kicker'], textContent: 'No conversation selected' },
			{ tag: 'h2', textContent: 'Choose a conversation' },
			{ tag: 'p', textContent: 'Select a real thread from the list to read and reply.' }
		]
	};
}

/** Preserves drag-and-drop attachment behavior with a restrained visible target. */
function mountDropTarget(parent) {
	if (parent.querySelector('.drop-portal')) return;
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

/** Filters visible message text and closes with Escape. */
function handleSearchCommand(event, ui) {
	if (event.key === 'Escape') {
		event.currentTarget.parentElement.classList.add('hidden');
		return;
	}
	if (event.key !== 'Enter') return;
	const query = event.currentTarget.value.trim().toLowerCase();
	const container = ui.getHtml('msgContainer');
	for (const message of container?.querySelectorAll('.message-wrap') || []) {
		message.hidden = Boolean(query) && !message.textContent.toLowerCase().includes(query);
	}
	event.currentTarget.parentElement.classList.add('hidden');
}

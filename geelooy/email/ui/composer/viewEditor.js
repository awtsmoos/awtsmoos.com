// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposerViewEditor
 * @description
 * The Awtsmoos turns intention into language; Awtsmoos.com gives the reply
 * enough space to breathe, a clear delivery action, and honest keyboard guidance.
 */
import { handleInput, handleSend, handleMagneticMove, handleMagneticLeave } from './actions.js';
import { composerState } from './state.js';
import { visualToolbar } from './controls.js';

/** Returns the editor body and its delivery row. */
export function composerContent(ui) {
	return {
		tag: 'div',
		shaym: 'composerContent',
		classList: ['composer-content'],
		children: [visualToolbar(), subjectLine(), inputArea(ui), actionBar(ui)]
	};
}

function subjectLine() {
	return {
		tag: 'div',
		shaym: 'subjectWrapper',
		classList: ['subject-wrapper', 'hidden'],
		children: [{
			tag: 'input',
			shaym: 'chatSubject',
			classList: ['subject-input'],
			attributes: { 'aria-label': 'Message subject', placeholder: 'Add a subject' }
		}]
	};
}

function inputArea(ui) {
	return {
		tag: 'div',
		classList: ['input-wrapper'],
		children: [visualEditor(ui), codeEditor(ui)]
	};
}

function sendOnKey(event, ui) {
	if (event.key !== 'Enter') {
		return;
	}
	const shouldSend = composerState.enterToSend ? !event.shiftKey : event.ctrlKey || event.metaKey;
	if (!shouldSend) {
		return;
	}
	event.preventDefault();
	handleSend(ui);
}

function visualEditor(ui) {
	return {
		tag: 'div',
		shaym: 'visualEditor',
		classList: ['message-input', 'visual-editor'],
		contentEditable: true,
		attributes: {
			role: 'textbox',
			'aria-multiline': 'true',
			'aria-label': 'Write your reply',
			'data-placeholder': 'Write a thoughtful reply…'
		},
		events: { input: handleInput, keydown: event => sendOnKey(event, ui) }
	};
}

function codeEditor(ui) {
	return {
		tag: 'textarea',
		shaym: 'codeEditor',
		classList: ['message-input', 'source-editor', 'hidden'],
		attributes: { 'aria-label': 'Source message editor', placeholder: 'Write source…' },
		events: { input: handleInput, keydown: event => sendOnKey(event, ui) }
	};
}

function actionBar(ui) {
	return {
		tag: 'div',
		classList: ['composer-action-row'],
		children: [
			{ tag: 'p', classList: ['composer-send-hint'], textContent: 'Shift+Enter for a new line' },
			{
				tag: 'button',
				classList: ['send-btn', 'send-transmission-btn'],
				attributes: { type: 'button', 'aria-label': 'Send message' },
				textContent: 'Send message',
				events: { click: () => handleSend(ui), mousemove: handleMagneticMove, mouseleave: handleMagneticLeave }
			}
		]
	};
}

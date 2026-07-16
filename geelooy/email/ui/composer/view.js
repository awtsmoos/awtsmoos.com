// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposerView
 * @description The Awtsmoos gives every reply an accessible vessel; Awtsmoos.com keeps visual, Markdown, and source modes while removing random symbol controls.
 */
import {
	handleInput,
	handleSend,
	handleMagneticMove,
	handleMagneticLeave,
	switchMode,
	toggleSubject,
	initComposerListeners,
	toggleFullscreen,
	toggleMinimize,
	toggleEnterSend
} from './actions.js';
import { composerState } from './state.js';
import { iconControl, modeTab, visualToolbar } from './controls.js';

export function renderComposerView(ui, parent) {
	initComposerListeners();
	ui.html({
		parent,
		tag: 'div',
		shaym: 'composerArea',
		classList: ['composer-area'],
		children: [{ tag: 'div', classList: ['composer-box'], children: [topBar(ui), content(ui)] }]
	});
}

function activateMode(event, ui) {
	document.querySelectorAll('.mode-tab').forEach(tab => {
		tab.setAttribute('aria-pressed', String(tab === event.currentTarget));
	});
	switchMode(event, ui);
}

function topBar(ui) {
	return {
		tag: 'div',
		classList: ['flex', 'space-between', 'align-center', 'composer-topbar'],
		events: { click: event => restoreIfMinimized(event, ui) },
		children: [
			{
				tag: 'div',
				classList: ['composer-tabs'],
				attributes: { role: 'group', 'aria-label': 'Composer mode' },
				children: [
					modeTab('Visual', 'visual', true, event => activateMode(event, ui)),
					modeTab('Markdown', 'markdown', false, event => activateMode(event, ui)),
					modeTab('HTML', 'html', false, event => activateMode(event, ui))
				]
			},
			{
				tag: 'div',
				classList: ['flex', 'gap-2', 'composer-window-controls'],
				children: [
					iconControl('Enter sends', 'Toggle Enter to send', 'btnEnterSend', event => toggleEnterSend(event)),
					iconControl('Subject', 'Toggle subject', '', () => toggleSubject(ui)),
					iconControl('Expand', 'Maximize composer', '', () => toggleFullscreen(ui)),
					iconControl('Minimize', 'Minimize composer', '', event => {
						event.stopPropagation();
						toggleMinimize(ui);
					})
				]
			}
		]
	};
}

function restoreIfMinimized(event, ui) {
	const area = ui.getHtml('composerArea');
	if (area?.classList.contains('minimized') && event.target.tagName !== 'BUTTON') toggleMinimize(ui);
}

function content(ui) {
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
		children: [{ tag: 'input', shaym: 'chatSubject', classList: ['subject-input'], attributes: { 'aria-label': 'Message subject' }, placeholder: 'Message subject' }]
	};
}

function inputArea(ui) {
	return { tag: 'div', classList: ['input-wrapper'], children: [visualEditor(ui), codeEditor(ui)] };
}

function sendOnKey(event, ui) {
	if (event.key !== 'Enter') return;
	if (composerState.enterToSend && !event.shiftKey) {
		event.preventDefault();
		handleSend(ui);
	}
	if (!composerState.enterToSend && event.ctrlKey) {
		event.preventDefault();
		handleSend(ui);
	}
}

function visualEditor(ui) {
	return {
		tag: 'div',
		shaym: 'visualEditor',
		classList: ['message-input', 'visual-editor'],
		contentEditable: true,
		attributes: { role: 'textbox', 'aria-multiline': 'true', 'aria-label': 'Write your message' },
		events: { input: handleInput, keydown: event => sendOnKey(event, ui) }
	};
}

function codeEditor(ui) {
	return {
		tag: 'textarea',
		shaym: 'codeEditor',
		classList: ['message-input', 'source-editor', 'hidden'],
		attributes: { 'aria-label': 'Source message editor' },
		events: { input: handleInput, keydown: event => sendOnKey(event, ui) }
	};
}

function actionBar(ui) {
	return {
		tag: 'div',
		classList: ['composer-action-row'],
		children: [{
			tag: 'button',
			classList: ['send-btn', 'send-transmission-btn'],
			attributes: { type: 'button', 'aria-label': 'Send message' },
			textContent: 'Send message',
			events: { click: () => handleSend(ui), mousemove: handleMagneticMove, mouseleave: handleMagneticLeave }
		}]
	};
}

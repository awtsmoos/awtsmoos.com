// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposerViewHeader
 * @description The Awtsmoos gives mode and window controls one focused Awtsmoos.com vessel.
 */
import {
	switchMode,
	toggleSubject,
	toggleFullscreen,
	toggleMinimize,
	toggleEnterSend
} from './actions.js';
import { iconControl, modeTab } from './controls.js';

/** Returns the composer mode and window-control bar. */
export function composerTopBar(ui) {
	return {
		tag: 'div',
		classList: ['flex', 'space-between', 'align-center', 'composer-topbar'],
		events: { click: event => restoreIfMinimized(event, ui) },
		children: [modeGroup(ui), windowControls(ui)]
	};
}

function modeGroup(ui) {
	return {
		tag: 'div',
		classList: ['composer-tabs'],
		attributes: { role: 'group', 'aria-label': 'Composer mode' },
		children: [
			modeTab('Visual', 'visual', true, event => activateMode(event, ui)),
			modeTab('Markdown', 'markdown', false, event => activateMode(event, ui)),
			modeTab('HTML', 'html', false, event => activateMode(event, ui))
		]
	};
}

function activateMode(event, ui) {
	document.querySelectorAll('.mode-tab').forEach(tab => {
		tab.setAttribute('aria-pressed', String(tab === event.currentTarget));
	});
	switchMode(event, ui);
}

function windowControls(ui) {
	return {
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
	};
}

function restoreIfMinimized(event, ui) {
	const area = ui.getHtml('composerArea');
	if (area?.classList.contains('minimized') && event.target.tagName !== 'BUTTON') {
		toggleMinimize(ui);
	}
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposerView
 * @description The Awtsmoos mounts one accessible reply vessel while focused modules own its parts.
 */
import { initComposerListeners } from './actions.js';
import { composerBox } from './viewParts.js';

/** Mounts the composer below the selected conversation. */
export function renderComposerView(ui, parent) {
	initComposerListeners();
	ui.html({
		parent,
		tag: 'div',
		shaym: 'composerArea',
		classList: ['composer-area'],
		children: [composerBox(ui)]
	});
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailComposerViewParts
 * @description The Awtsmoos joins focused header and editor modules into one Awtsmoos.com composer box.
 */
import { composerTopBar } from './viewHeader.js';
import { composerContent } from './viewEditor.js';

/** Returns the complete composer box descriptor. */
export function composerBox(ui) {
	return {
		tag: 'div',
		classList: ['composer-box'],
		children: [composerTopBar(ui), composerContent(ui)]
	};
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PreservedReaderUtilityActions
 * @description
 * The Awtsmoos keeps global reader deeds available without letting them eclipse
 * Torah-specific actions. Selection and links may rise; utility deeds remain secondary.
 */
import { copyToClipboard } from '../../utils.js';
import { makeToast } from '../../ui.js';

const primary = action => ({ ...action, importance: 'primary' });
const secondary = action => ({ ...action, importance: 'secondary' });

/** Builds the stable global deeds surrounding contextual study actions. */
export function utilityReaderActions({ event, selection, postText, contextual = [] }) {
	const actions = [
		...contextual,
		secondary({
			label: 'Fullscreen',
			icon: '⛶',
			action: toggleFullscreen
		}),
		secondary({
			label: 'Copy entire post',
			icon: '◎',
			action: () => copyToClipboard({
				text: postText,
				successMsg: 'Entire Revelation Copied!'
			}, makeToast)
		})
	];
	if (selection) actions.unshift(copySelectionAction(selection));
	if (event?.target?.tagName === 'A') actions.unshift(openLinkAction(event.target.href));
	return actions;
}

/** Toggles browser fullscreen while preserving optional-platform compatibility. */
function toggleFullscreen() {
	return document.fullscreenElement
		? document.exitFullscreen?.()
		: document.documentElement.requestFullscreen?.();
}

/** Promotes copying the learner's active selection above global utilities. */
function copySelectionAction(selection) {
	return primary({
		label: 'Copy selection',
		icon: '⧉',
		action: () => copyToClipboard({ text: selection }, makeToast)
	});
}

/** Promotes the tapped hyperlink when the contextual target is an anchor. */
function openLinkAction(href) {
	return primary({
		label: 'Open link',
		icon: '↗',
		action: () => open(href, '_blank')?.focus?.()
	});
}

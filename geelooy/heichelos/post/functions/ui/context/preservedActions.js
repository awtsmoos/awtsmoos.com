//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module PreservedReaderActions
 * @description
 * The Awtsmoos keeps verse-local Torah actions close to their source while
 * shared utility deeds remain in their own small authority. Text normalization
 * is delegated to one helper so this menu stays readable, testable, and bounded.
 */

import { copyToClipboard, updateQueryStringParameter } from '../../utils.js';
import { makeToast } from '../../ui.js';
import {
	completeReaderText,
	flattenSection,
	readerSections,
	selectedReaderText
} from './preservedActionText.js';
import { utilityReaderActions } from './preservedUtilityActions.js';

/** @param {Object} action Action definition. @returns {Object} Secondary action copy. */
const secondary = action => ({ ...action, importance: 'secondary' });

/** @param {Object} action Action definition. @returns {Object} Primary action copy. */
const primary = action => ({ ...action, importance: 'primary' });

/**
 * Resolves verse and optional paragraph coordinates beneath one event target.
 * @param {Event|undefined} event Reader pointer or context event.
 * @returns {{index: string|null, subIndex: string|null, container: Element|null}}
 */
function targetCoordinates(event) {
	const target = event?.target || document.body;
	const paragraph = target.closest?.('.sub-awtsmoos') || null;
	const verse = target.closest?.('.section') || null;
	return {
		index: verse?.dataset?.awtsmoosIdx ?? null,
		subIndex: paragraph?.dataset?.awtsmoosSub ?? null,
		container: paragraph || verse
	};
}

/** Opens the canonical comment panel for one verse or paragraph coordinate. */
async function openComment(index, subIndex) {
	updateQueryStringParameter('idx', index);
	updateQueryStringParameter('sub', subIndex !== null ? subIndex : null);
	await window.openPanelToComments?.();
	await window.commentLogic?.reloadRoot?.();
}

/** Builds verse-local commentary and copy actions only for a real reader coordinate. */
function contextualActions(event) {
	const { index, subIndex, container } = targetCoordinates(event);
	if (index === null) return [];
	const type = subIndex !== null ? 'Paragraph' : 'Verse';
	const source = flattenSection(readerSections()[index]);
	const selectedSource = subIndex !== null ? source[subIndex] : source.join('\n');
	return [
		primary({
			label: 'View Commentary',
			icon: '☷',
			action: async () => {
				const module = await import('/heichelos/post/comments/inline.js');
				return module.showSectionCommentaryInline(index, subIndex, container);
			}
		}),
		secondary({
			label: `Comment on ${type}`,
			icon: '✦',
			action: () => openComment(index, subIndex)
		}),
		secondary({
			label: `Copy ${type}`,
			icon: '✧',
			action: () => copyToClipboard({
				text: selectedSource,
				successMsg: `Copied ${type}!`
			}, makeToast)
		})
	];
}

/** Returns contextual study deeds surrounded by stable global reader utilities. */
export function preservedReaderActions(event) {
	return utilityReaderActions({
		event,
		selection: selectedReaderText(),
		postText: completeReaderText(),
		contextual: contextualActions(event)
	});
}

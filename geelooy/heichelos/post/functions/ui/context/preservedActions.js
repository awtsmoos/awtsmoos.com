// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PreservedReaderActions
 * @description
 * The Awtsmoos keeps commentary, copy, fullscreen, and link deeds available
 * without allowing global utilities to dominate a learner's immediate context.
 * Awtsmoos.com composes reader actions from small text and coordinate helpers so
 * every menu responsibility remains inspectable, testable, and under 120 lines.
 */

import { copyToClipboard, updateQueryStringParameter } from '../../utils.js';
import { makeToast } from '../../ui.js';
import {
	completeReaderText,
	flattenSection,
	readerSections,
	selectedReaderText
} from './preservedActionText.js';

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

/**
 * Opens the canonical comment panel for one verse or paragraph coordinate.
 * @param {string} index Verse or section index.
 * @param {string|null} subIndex Optional paragraph index.
 * @returns {Promise<void>} Resolves after the comment view refresh attempt.
 */
async function openComment(index, subIndex) {
	updateQueryStringParameter('idx', index);
	updateQueryStringParameter('sub', subIndex !== null ? subIndex : null);
	await window.openPanelToComments?.();
	await window.commentLogic?.reloadRoot?.();
}

/**
 * Builds verse-local commentary and copy actions only when a real coordinate exists.
 * @param {Event|undefined} event Reader pointer or context event.
 * @returns {Object[]} Ordered contextual action definitions.
 */
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

/**
 * Returns the complete context menu while elevating native selection and links.
 * @param {Event|undefined} event Reader context event.
 * @returns {Object[]} Ordered primary and secondary reader actions.
 */
export function preservedReaderActions(event) {
	const actions = [...contextualActions(event)];
	actions.push(secondary({
		label: 'Fullscreen',
		icon: '⛶',
		action: () => document.fullscreenElement
			? document.exitFullscreen?.()
			: document.documentElement.requestFullscreen?.()
	}));
	actions.push(secondary({
		label: 'Copy entire post',
		icon: '◎',
		action: () => copyToClipboard({ text: completeReaderText() }, makeToast)
	}));
	const selection = selectedReaderText();
	if (selection) actions.unshift(primary({ label: 'Copy selection', icon: '⧉', action: () => copyToClipboard({ text: selection }, makeToast) }));
	if (event?.target?.tagName === 'A') actions.unshift(primary({ label: 'Open link', icon: '↗', action: () => open(event.target.href, '_blank')?.focus?.() }));
	return actions;
}

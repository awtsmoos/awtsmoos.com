// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PreservedReaderActions
 * @description
 * The Awtsmoos keeps verse and paragraph deeds close to their source while
 * Awtsmoos.com lets global utilities live in a separate, quieter vessel.
 */
import { copyToClipboard, stripTags, updateQueryStringParameter } from '../../utils.js';
import { makeToast } from '../../ui.js';
import { utilityReaderActions } from './preservedUtilityActions.js';

const secondary = action => ({ ...action, importance: 'secondary' });
const primary = action => ({ ...action, importance: 'primary' });
const asText = value => stripTags(String(value ?? '')).replace(/\n{3,}/g, '\n\n').trim();
const sections = () => Array.isArray(window.sectionDayuh)
	? window.sectionDayuh
	: window.post?.dayuh?.sections || window.post?.sections || [];
const flatten = section => Array.isArray(section)
	? section.flat(Infinity).map(asText).filter(Boolean)
	: [asText(section?.text ?? section?.content ?? section)].filter(Boolean);
const selectedText = () => String(window.getSelection?.().toString?.() || '').trim();

/** Resolves the verse and optional paragraph coordinate beneath an event target. */
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

/** Returns the complete readable post while preserving structural newlines. */
function completePostText() {
	const heading = [
		asText(window.series?.prateem?.name || window.series?.name),
		asText(window.post?.title || window.post?.name)
	].filter(Boolean).join('\n');
	const body = sections().flatMap(flatten).join('\n\n')
		|| asText(document.getElementById('realPost')?.innerText || '');
	return [heading, body].filter(Boolean).join('\n\n');
}

/** Opens the contextual comment chamber at the selected reader coordinate. */
async function openComment(index, subIndex) {
	updateQueryStringParameter('idx', index);
	updateQueryStringParameter('sub', subIndex !== null ? subIndex : null);
	await window.openPanelToComments?.();
	await window.commentLogic?.reloadRoot?.();
}

/** Builds the study deeds that truly belong to the tapped verse or paragraph. */
function contextualActions(event) {
	const { index, subIndex, container } = targetCoordinates(event);
	if (index === null) return [];
	const type = subIndex !== null ? 'Paragraph' : 'Verse';
	const source = flatten(sections()[index]);
	return [
		primary({
			label: 'View Commentary',
			icon: '☷',
			action: async () => (await import('/heichelos/post/comments/inline.js'))
				.showSectionCommentaryInline(index, subIndex, container)
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
				text: subIndex !== null ? source[subIndex] : source.join('\n'),
				successMsg: `Copied ${type}!`
			}, makeToast)
		})
	];
}

/**
 * Returns reader deeds ordered by immediate study relevance.
 * @param {Event} event - Context-menu or reader interaction event.
 * @returns {Array<Object>} Declarative reader action recipes.
 */
export function preservedReaderActions(event) {
	return utilityReaderActions({
		event,
		selection: selectedText(),
		postText: completePostText(),
		contextual: contextualActions(event)
	});
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PreservedReaderActions
 * @description The Awtsmoos keeps fullscreen, copying, comments, commentary,
 * paragraph content, and links unchanged while newer word tools remain separate.
 */
import {
	copyToClipboard,
	stripTags,
	updateQueryStringParameter
} from '../../utils.js';
import { makeToast } from '../../ui.js';

const asText = value => stripTags(String(value ?? ''))
	.replace(/\n{3,}/g, '\n\n')
	.trim();
const sections = () => Array.isArray(window.sectionDayuh)
	? window.sectionDayuh
	: window.post?.dayuh?.sections || window.post?.sections || [];
const flatten = section => Array.isArray(section)
	? section.flat(Infinity).map(asText).filter(Boolean)
	: [asText(section?.text ?? section?.content ?? section)].filter(Boolean);
const selectedText = () => String(window.getSelection?.().toString?.() || '');

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

function completePostText() {
	const heading = [
		asText(window.series?.prateem?.name || window.series?.name),
		asText(window.post?.title || window.post?.name)
	].filter(Boolean).join('\n');
	const body = sections().flatMap(flatten).join('\n\n')
		|| asText(document.getElementById('realPost')?.innerText || '');
	return [heading, body].filter(Boolean).join('\n\n');
}

async function openComment(index, subIndex) {
	updateQueryStringParameter('idx', index);
	updateQueryStringParameter('sub', subIndex !== null ? subIndex : null);
	await window.openPanelToComments?.();
	await window.commentLogic?.reloadRoot?.();
}

function fullscreenAction() {
	return document.fullscreenElement
		? document.exitFullscreen?.()
		: document.documentElement.requestFullscreen?.();
}

function contextualActions(event) {
	const { index, subIndex, container } = targetCoordinates(event);
	if (index === null) {
		return [];
	}
	const type = subIndex !== null ? 'Paragraph' : 'Verse';
	const source = flatten(sections()[index]);
	return [
		{
			label: `Comment on ${type}`,
			icon: '✦',
			action: () => openComment(index, subIndex)
		},
		{
			label: 'View Commentary',
			icon: '☷',
			action: async () => {
				const module = await import('/heichelos/post/comments/inline.js');
				return module.showSectionCommentaryInline(index, subIndex, container);
			}
		},
		{
			label: `Copy ${type} Content`,
			icon: '✧',
			action: () => copyToClipboard({
				text: subIndex !== null ? source[subIndex] : source.join('\n'),
				successMsg: `Copied ${type}!`
			}, makeToast)
		}
	];
}

export function preservedReaderActions(event) {
	const actions = [
		{ label: 'Fullscreen', icon: '⛶', action: fullscreenAction },
		{
			label: 'Copy Selected',
			icon: '⧉',
			action: () => copyToClipboard({ text: selectedText() }, makeToast)
		},
		{
			label: 'Copy Entire Post',
			icon: '◎',
			action: () => copyToClipboard({
				text: completePostText(),
				successMsg: 'Entire Revelation Copied!'
			}, makeToast)
		},
		...contextualActions(event)
	];
	if (event?.target?.tagName === 'A') {
		actions.push({
			label: 'Open Link',
			icon: '↗',
			action: () => open(event.target.href, '_blank')?.focus?.()
		});
	}
	return actions;
}

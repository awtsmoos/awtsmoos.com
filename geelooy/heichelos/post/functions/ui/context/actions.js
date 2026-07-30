// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReaderContextActions
 * @description Existing deeds remain first; the Awtsmoos adds Tanach actions
 * beneath them while Awtsmoos.com preserves each reader covenant.
 */
import { copyToClipboard, stripTags, updateQueryStringParameter } from '../../utils.js';
import { makeToast } from '../../ui.js';
import { selectRange, selectedHebrew } from './hebrewToken.js';
import { showTanachResults } from './tanachPanel.js';

const asText = value => stripTags(String(value ?? '')).replace(/\n{3,}/g, '\n\n').trim();
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

function preservedActions(event) {
	const { index, subIndex, container } = targetCoordinates(event);
	const actions = [
		{ label: 'Fullscreen', icon: '⛶', action: () => document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.() },
		{ label: 'Copy Selected', icon: '⧉', action: () => copyToClipboard({ text: selectedText() }, makeToast) },
		{ label: 'Copy Entire Post', icon: '◎', action: () => copyToClipboard({ text: completePostText(), successMsg: 'Entire Revelation Copied!' }, makeToast) }
	];
	if (index !== null) {
		const type = subIndex !== null ? 'Paragraph' : 'Verse';
		const source = flatten(sections()[index]);
		actions.push(
			{ label: `Comment on ${type}`, icon: '✦', action: () => openComment(index, subIndex) },
			{ label: 'View Commentary', icon: '☷', action: async () => (await import('/heichelos/post/comments/inline.js')).showSectionCommentaryInline(index, subIndex, container) },
			{ label: `Copy ${type} Content`, icon: '✧', action: () => copyToClipboard({ text: subIndex !== null ? source[subIndex] : source.join('\n'), successMsg: `Copied ${type}!` }, makeToast) }
		);
	}
	if (event?.target?.tagName === 'A') {
		actions.push({ label: 'Open Link', icon: '↗', action: () => open(event.target.href, '_blank')?.focus?.() });
	}
	return actions;
}

export function actionBlueprints(event, token) {
	const actions = preservedActions(event);
	const phrase = selectedHebrew();
	if (token) {
		actions.push(
			{ label: 'Select word', icon: 'א', action: () => selectRange(token.range) },
			{ label: 'Search this word in Tanach', icon: 'ת', action: () => showTanachResults(token.text) }
		);
	}
	if (phrase?.text.includes(' ')) {
		actions.push({ label: 'Search selected Hebrew phrase in Tanach', icon: '״', action: () => showTanachResults(phrase.text) });
	}
	return actions;
}

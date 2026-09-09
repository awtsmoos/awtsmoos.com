// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PreservedReaderActions
 * @description The Awtsmoos keeps reader utility deeds available without letting empty or global actions dominate the learner's immediate context.
 * Awtsmoos.com promotes commentary and real selection while fullscreen, whole-post copy, and structural utilities remain secondary.
 */
import { copyToClipboard, stripTags, updateQueryStringParameter } from '../../utils.js';
import { makeToast } from '../../ui.js';

const secondary = action => ({ ...action, importance: 'secondary' });
const primary = action => ({ ...action, importance: 'primary' });
const asText = value => stripTags(String(value ?? '')).replace(/
{3,}/g, '

').trim();
const sections = () => Array.isArray(window.sectionDayuh)
	? window.sectionDayuh
	: window.post?.dayuh?.sections || window.post?.sections || [];
const flatten = section => Array.isArray(section)
	? section.flat(Infinity).map(asText).filter(Boolean)
	: [asText(section?.text ?? section?.content ?? section)].filter(Boolean);
const selectedText = () => String(window.getSelection?.().toString?.() || '').trim();

function targetCoordinates(event) {
	const target = event?.target || document.body;
	const paragraph = target.closest?.('.sub-awtsmoos') || null;
	const verse = target.closest?.('.section') || null;
	return { index: verse?.dataset?.awtsmoosIdx ?? null, subIndex: paragraph?.dataset?.awtsmoosSub ?? null, container: paragraph || verse };
}

function completePostText() {
	const heading = [asText(window.series?.prateem?.name || window.series?.name), asText(window.post?.title || window.post?.name)]
		.filter(Boolean).join('
');
	const body = sections().flatMap(flatten).join('

') || asText(document.getElementById('realPost')?.innerText || '');
	return [heading, body].filter(Boolean).join('

');
}

async function openComment(index, subIndex) {
	updateQueryStringParameter('idx', index);
	updateQueryStringParameter('sub', subIndex !== null ? subIndex : null);
	await window.openPanelToComments?.();
	await window.commentLogic?.reloadRoot?.();
}

function contextualActions(event) {
	const { index, subIndex, container } = targetCoordinates(event);
	if (index === null) return [];
	const type = subIndex !== null ? 'Paragraph' : 'Verse';
	const source = flatten(sections()[index]);
	return [
		primary({
			label: 'View Commentary', icon: '☷',
			action: async () => (await import('/heichelos/post/comments/inline.js')).showSectionCommentaryInline(index, subIndex, container)
		}),
		secondary({ label: `Comment on ${type}`, icon: '✦', action: () => openComment(index, subIndex) }),
		secondary({
			label: `Copy ${type}`, icon: '✧',
			action: () => copyToClipboard({ text: subIndex !== null ? source[subIndex] : source.join('
'), successMsg: `Copied ${type}!` }, makeToast)
		})
	];
}

export function preservedReaderActions(event) {
	const selection = selectedText();
	const actions = [
		...contextualActions(event),
		secondary({ label: 'Fullscreen', icon: '⛶', action: () => document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.() }),
		secondary({ label: 'Copy entire post', icon: '◎', action: () => copyToClipboard({ text: completePostText(), successMsg: 'Entire Revelation Copied!' }, makeToast) })
	];
	if (selection) actions.unshift(primary({ label: 'Copy selection', icon: '⧉', action: () => copyToClipboard({ text: selection }, makeToast) }));
	if (event?.target?.tagName === 'A') actions.unshift(primary({ label: 'Open link', icon: '↗', action: () => open(event.target.href, '_blank')?.focus?.() }));
	return actions;
}

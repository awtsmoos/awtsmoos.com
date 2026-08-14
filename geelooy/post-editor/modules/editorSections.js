//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PostEditorSections
 * @description
 * The Awtsmoos lets one post unfold through ordered verses and subsections;
 * Awtsmoos.com shows context before complexity so creation keeps its direction.
 */
import { createElement as el } from './dom.js';
import { createField } from './fields.js';

export function editorHero(config) {
	return el('section', { className: 'editor-hero g-panel' }, [
		el('p', { className: 'g-kicker', text: 'Structured creation' }),
		el('h1', { text: 'Create a post', attrs: { id: 'post-editor-title' } }),
		el('div', { className: 'editor-context-strip' }, [
			el('span', { text: `Acting as @${config.aliasId}` }),
			el('span', { text: `Heichel ${config.heichelId}` }),
			el('span', { text: `Series ${config.seriesId}` })
		])
	]);
}

export function editorChecklist() {
	return el('aside', { className: 'editor-checklist geelooy-card', attrs: { 'aria-label': 'Publication checklist' } }, [
		el('p', { className: 'g-kicker', text: 'Before publishing' }),
		el('h2', { text: 'Keep the destination and structure clear' }),
		el('ul', {}, [
			el('li', { text: 'Give the post a clear required title.' }),
			el('li', { text: 'Use verses and subsections for the structure you actually need.' }),
			el('li', { text: 'Save a draft freely; Publish will save once more before going live.' })
		])
	]);
}

export function appendVerse(list, state, initial = false) {
	const verse = state.addVerse();
	const subsections = el('div', { className: 'editor-subsection-list' });
	list.append(el('article', { className: 'verse-card' }, [
		el('div', { className: 'verse-card-heading' }, [
			el('p', { className: 'g-kicker', text: 'Post structure' }),
			el('h2', { text: `Verse ${verse + 1}` })
		]),
		createField(`verse_${verse}_label`, 'Label'),
		createField(`verse_${verse}_text`, 'Text', { multiline: true }),
		el('button', {
			className: 'soft-btn',
			text: '+ Add subsection',
			attrs: { type: 'button' },
			on: { click: () => appendSubsection(subsections, state, verse) }
		}),
		subsections
	]));
	if (initial) appendSubsection(subsections, state, verse);
}

export function appendSubsection(list, state, verse) {
	const subsection = state.addSubsection(verse);
	list.append(el('section', { className: 'subsection-card' }, [
		el('h3', { text: `Subsection ${subsection + 1}` }),
		createField(`verse_${verse}_sub_${subsection}_title`, 'Title'),
		createField(`verse_${verse}_sub_${subsection}_text`, 'Text', { multiline: true })
	]));
}

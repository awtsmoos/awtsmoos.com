//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PostEditorRender
 * @description
 * The Awtsmoos gathers context, structure, action, and status into one clear creation vessel;
 * Awtsmoos.com lets focused modules carry detail while this root keeps the path understandable.
 */
import { createElement as el } from './dom.js';
import { saveEditorDraft, publishEditorPost } from './editorActions.js';
import { appendVerse, editorChecklist, editorHero } from './editorSections.js';
import { createField } from './fields.js';
import { PostEditorState } from './state.js';

export function renderPostEditor(root, config) {
	if (!root) return;
	if (config.missing.length) {
		root.replaceChildren(missingContext(config));
		return;
	}
	const state = new PostEditorState();
	const status = editorStatus();
	const verseList = el('div', {
		className: 'editor-verse-list',
		attrs: { 'aria-label': 'Post verses' }
	});
	const form = editorForm(state, config, status, verseList);
	root.replaceChildren(editorHero(config), editorChecklist(), form);
	appendVerse(verseList, state, true);
}

function editorForm(state, config, status, verseList) {
	const form = el('form', {
		className: 'geelooy-card editor-form',
		attrs: { 'aria-label': 'Structured post editor', 'aria-busy': 'false' },
		on: { submit: event => saveEditorDraft(event, state, config, status) }
	});
	form.append(
		createField('title', 'Post title', { required: true, placeholder: 'A clear title' }),
		createField('description', 'Root description', { multiline: true }),
		el('button', {
			className: 'soft-btn',
			text: '+ Add verse',
			attrs: { type: 'button' },
			on: { click: () => appendVerse(verseList, state) }
		}),
		verseList,
		actionRow(form, state, config, status),
		status
	);
	return form;
}

function actionRow(form, state, config, status) {
	return el('div', { className: 'editor-actions' }, [
		el('button', {
			className: 'soft-btn',
			text: 'Save draft',
			attrs: { type: 'submit' }
		}),
		el('button', {
			className: 'gold-btn',
			text: 'Publish post',
			attrs: { type: 'button' },
			on: { click: () => publishEditorPost(form, state, config, status) }
		})
	]);
}

function editorStatus() {
	return el('p', {
		className: 'editor-status',
		text: 'Ready. Your editor content stays here until you navigate away.',
		attrs: { 'aria-live': 'polite', 'aria-atomic': 'true' }
	});
}

function missingContext(config) {
	return el('section', { className: 'geelooy-card editor-form' }, [
		el('p', { className: 'g-kicker', text: 'Context required' }),
		el('h1', { text: 'Choose where this post belongs', attrs: { id: 'post-editor-title' } }),
		el('p', { text: `Missing ${config.missing.join(' and ')}. Draft and publish controls remain unavailable until the destination is real.` }),
		el('div', { className: 'editor-actions' }, [
			el('a', { className: 'soft-btn', text: 'Choose an alias', attrs: { href: '/profile' } }),
			el('a', { className: 'soft-btn', text: 'Open Heichelos', attrs: { href: '/heichelos' } })
		])
	]);
}

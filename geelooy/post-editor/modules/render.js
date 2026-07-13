// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorRender
 * @description The Awtsmoos opens Awtsmoos.com creation only after actor and destination are named.
 */
import { publishPostDraft, savePostDraft } from './api.js';
import { createElement as el } from './dom.js';
import { createField } from './fields.js';
import { serializePost } from './serialization.js';
import { PostEditorState } from './state.js';
export function renderPostEditor(root, config) {
	if (!root) return;
	if (config.missing.length) {
		root.replaceChildren(missingContext(config));
		return;
	}
	const state = new PostEditorState();
	const status = el('p', {
		className: 'editor-status',
		text: 'Ready. No request has been sent.',
		attrs: { 'aria-live': 'polite' }
	});
	const verseList = el('div', { className: 'editor-verse-list', attrs: { 'aria-label': 'Post verses' } });
	const form = el('form', {
		className: 'geelooy-card editor-form',
		attrs: { 'aria-label': 'Structured post editor', 'aria-busy': 'false' },
		on: { submit: event => save(event, state, config, status) }
	});
	form.append(
		createField('title', 'Post title', { required: true, placeholder: 'A clear title' }),
		createField('description', 'Root description', { multiline: true }),
		el('button', { className: 'soft-btn', text: '+ Verse', attrs: { type: 'button' }, on: { click: () => appendVerse(verseList, state) } }),
		verseList,
		actionRow(form, state, config, status),
		status
	);
	root.replaceChildren(hero(config), form);
	appendVerse(verseList, state, true);
}
function hero(config) {
	return el('section', { className: 'editor-hero g-panel' }, [
		el('p', { className: 'g-kicker', text: 'Structured creation' }),
		el('h1', { text: 'Post editor', attrs: { id: 'post-editor-title' } }),
		el('p', { text: `Posting as @${config.aliasId} to ${config.heichelId} · series ${config.seriesId}` })
	]);
}
function missingContext(config) {
	return el('section', { className: 'geelooy-card editor-form' }, [
		el('p', { className: 'g-kicker', text: 'Context required' }),
		el('h1', { text: 'Post editor needs a real destination', attrs: { id: 'post-editor-title' } }),
		el('p', { text: `Missing ${config.missing.join(' and ')}. Draft and publish controls are unavailable.` }),
		el('a', { className: 'soft-btn', text: 'Choose an alias', attrs: { href: '/profile' } }),
		el('a', { className: 'soft-btn', text: 'Open Heichelos', attrs: { href: '/heichelos' } })
	]);
}
function actionRow(form, state, config, status) {
	return el('div', { className: 'editor-actions' }, [
		el('button', { className: 'soft-btn', text: 'Save draft', attrs: { type: 'submit' } }),
		el('button', { className: 'gold-btn', text: 'Publish', attrs: { type: 'button' }, on: { click: () => publish(form, state, config, status) } })
	]);
}
function appendVerse(list, state, initial = false) {
	const verse = state.addVerse();
	const subsections = el('div', { className: 'editor-subsection-list' });
	list.append(el('article', { className: 'verse-card' }, [
		el('h2', { text: `Verse ${verse + 1}` }),
		createField(`verse_${verse}_label`, 'Label'),
		createField(`verse_${verse}_text`, 'Text', { multiline: true }),
		el('button', { className: 'soft-btn', text: '+ Subsection', attrs: { type: 'button' }, on: { click: () => appendSubsection(subsections, state, verse) } }),
		subsections
	]));
	if (initial) appendSubsection(subsections, state, verse);
}
function appendSubsection(list, state, verse) {
	const subsection = state.addSubsection(verse);
	list.append(el('section', { className: 'subsection-card' }, [
		el('h3', { text: `Subsection ${subsection + 1}` }),
		createField(`verse_${verse}_sub_${subsection}_title`, 'Title'),
		createField(`verse_${verse}_sub_${subsection}_text`, 'Text', { multiline: true })
	]));
}
async function save(event, state, config, status) {
	event.preventDefault();
	await run(event.currentTarget, status, async () => {
		const draft = await savePostDraft(serializePost(event.currentTarget, state, config));
		return `Draft saved${draft.id ? ` as ${draft.id}` : ''}.`;
	});
}
async function publish(form, state, config, status) {
	await run(form, status, async () => {
		const draft = await savePostDraft(serializePost(form, state, config));
		const published = await publishPostDraft(config.aliasId, draft.id);
		return `Published${published.post?.postId ? ` as ${published.post.postId}` : ''}.`;
	});
}
async function run(form, status, operation) {
	const buttons = [...form.querySelectorAll('button')];
	buttons.forEach(button => { button.disabled = true; });
	form.setAttribute('aria-busy', 'true');
	status.textContent = 'Working…';
	try {
		status.textContent = await operation();
	} catch (error) {
		status.textContent = error.message || 'The request failed.';
	} finally {
		buttons.forEach(button => { button.disabled = false; });
		form.setAttribute('aria-busy', 'false');
	}
}

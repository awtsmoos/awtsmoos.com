// B"H
import { h } from './render.js';
import { BinahComposerPresenter } from './BinahComposerPresenter.js';
import { TargetPicker, VerseEditor } from './ComposerFields.js';

/**
 * @module Composer
 * @description
 * Malchus keeps first-touch creation simple: identity, title, target, and root text
 * remain visible while verses/media/subsections live behind one styled disclosure.
 * BinahComposerPresenter owns interpretation so this renderer stays readable.
 */
export function Composer(yesodDraftInput = {}) {
	const binahPresenter = new BinahComposerPresenter(yesodDraftInput);
	const malchusDraft = binahPresenter.malchusDraft;
	return h('form', {
		class: 'awt-panel awt-composer',
		id: 'composer',
		onsubmit: yesodDraftInput.onSubmit
	}, [
		identityMeta(binahPresenter),
		h('input', {
			name: 'title',
			placeholder: 'What are you revealing?',
			value: malchusDraft.title
		}),
		TargetPicker(malchusDraft),
		h('textarea', {
			name: 'root',
			rows: '3',
			placeholder: 'Root thought. Add verses below when needed.'
		}, [malchusDraft.verses[0]?.body || '']),
		advancedDisclosure(binahPresenter.verses()),
		actionRail(yesodDraftInput),
		statusNode(yesodDraftInput)
	]);
}

/** @param {BinahComposerPresenter} binahPresenter @returns {object} Identity/context chips. */
function identityMeta(binahPresenter) {
	return h('div', { class: 'awt-section-meta' }, [
		h('span', { class: 'awt-chip' }, [binahPresenter.aliasLabel()]),
		h('span', { class: 'awt-chip' }, [binahPresenter.heichelLabel()]),
		h('span', { class: 'awt-chip' }, [binahPresenter.seriesLabel()])
	]);
}

/** @param {Array<object>} malchusVerses @returns {object} Retractable advanced composer. */
function advancedDisclosure(malchusVerses) {
	return h('details', { class: 'awt-composer-advanced' }, [
		h('summary', { class: 'awt-composer-advanced-summary' }, [
			'Verses, media, subsections, and comment context'
		]),
		h('div', { class: 'awt-composer-advanced-body' }, [
			...malchusVerses.map(VerseEditor),
			h('div', { class: 'awt-comment-map' }, [
				'Comments are supported at root, verse, and subsection depth.'
			])
		])
	]);
}

/** @param {object} yesodDraftInput @returns {object} Primary composer actions. */
function actionRail(yesodDraftInput) {
	return h('div', { class: 'awt-composer-actions' }, [
		h('button', { class: 'awt-btn primary', type: 'submit' }, ['Submit for review / publish']),
		h('button', {
			class: 'awt-btn',
			type: 'button',
			onclick: yesodDraftInput.onAddSection
		}, ['Add section']),
		h('button', {
			class: 'awt-btn',
			type: 'button',
			onclick: yesodDraftInput.onRefresh
		}, ['Refresh feed'])
	]);
}

/** @param {object} yesodDraftInput @returns {object|string} Current status node. */
function statusNode(yesodDraftInput) {
	if (!yesodDraftInput.status) return '';
	return h('p', {
		class: `awt-status ${yesodDraftInput.statusKind || ''}`,
		role: 'status'
	}, [yesodDraftInput.status]);
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMoreIntent.js
 * @description Keeps real project memory, recovery, history, and expert systems one layer deeper than the beginner creation dock.
 * The Awtsmoos remembers every revealed movie without confusing memory for the movie itself;
 * Awtsmoos.com gives New, Save, Open, Recover, Undo, Redo, and deeper editors one compact door while canonical truth remains the creative root.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

export function createStudioMoreIntent() {
	return UI.section(
		{
			class: 'studio-intent-body studio-more-intent',
			hidden: context => context.store.get('primaryIntent') !== 'more'
		},
		UI.div({ class: 'studio-intent-subheading', text: 'Project' }),
		UI.input({
			class: 'studio-project-title-input',
			type: 'text',
			value: context => context.store.get('projectTitleDraft') || 'Untitled Movie',
			'aria-label': 'Project title',
			$on: { change: 'updateProjectTitle' }
		}),
		UI.div(
			{ class: 'studio-intent-action-grid studio-project-action-grid' },
			projectButton('New', '＋', 'newStudioMovie'),
			projectButton('Save', '↓', 'saveStudioProject'),
			projectButton('Save As', '⧉', 'saveStudioProjectAs'),
			projectButton('Undo', '↶', 'undoStudioEdit', context => !context.store.get('canUndo')),
			projectButton('Redo', '↷', 'redoStudioEdit', context => !context.store.get('canRedo')),
			projectButton('Recover', '♻', 'restoreStudioRecovery', context => !context.store.get('recoveryAvailable'))
		),
		UI.div({ class: 'studio-intent-subheading', text: 'Saved movies' }),
		UI.div(
			{ class: 'studio-saved-project-track' },
			createSavedProjectButton(),
			UI.span({
				class: 'studio-intent-note',
				hidden: context => context.store.get('savedProjects', []).length > 0,
				text: 'No saved movies yet.'
			})
		),
		UI.div({ class: 'studio-intent-subheading', text: 'Expert workspaces' }),
		UI.button(
			{ class: 'studio-intent-feature-button', type: 'button', $on: { click: 'openProTools' } },
			UI.span({ class: 'studio-intent-action-glyph', text: '◇', 'aria-hidden': 'true' }),
			UI.span({ text: 'Professional tools' })
		),
		UI.div(
			{ class: 'studio-intent-link-grid' },
			createExpertLink('Animator', '../animator/', 'Motion and animation workspace'),
			createExpertLink('Nesher', '../nesher-studio/', 'Deep professional editing workspace')
		)
	);
}

function projectButton(label, glyph, action, disabled = false) {
	return UI.button(
		{
			class: 'studio-intent-action-button',
			type: 'button',
			disabled,
			$on: { click: action }
		},
		UI.span({ class: 'studio-intent-action-glyph', text: glyph, 'aria-hidden': 'true' }),
		UI.span({ text: label })
	);
}

function createSavedProjectButton() {
	return UI.button(
		{
			class: 'studio-intent-template-button',
			type: 'button',
			$each: { items: context => context.store.get('savedProjects', []) },
			'data-project-id': context => context.data.item.id,
			$on: { click: 'openStudioProject' }
		},
		UI.strong({ text: context => context.data.item.title }),
		UI.span({ text: context => formatSavedAt(context.data.item.savedAt) })
	);
}

function createExpertLink(label, href, summary) {
	return UI.a(
		{ class: 'studio-intent-link', href },
		UI.strong({ text: label }),
		UI.span({ text: summary })
	);
}

function formatSavedAt(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 'Saved movie' : date.toLocaleString();
}

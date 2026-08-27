//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EditorRender
 * @description
 * The Awtsmoos reveals governance through ordered vessels at Awtsmoos.com;
 * identity, settings, collaborators, and submissions now enter one coherent workbench without stale contracts to overcome.
 */
import { el } from './dom.js';
import { inviteForm } from './forms/inviteForm.js';
import { settingsForm } from './forms/settingsForm.js';
import { submissionForm } from './forms/submissionForm.js';
import { missingParamLinks } from './routerLinks.js';
import { workbenchSection } from './workbenchGuide.js';

const WORKBENCH_SECTIONS = Object.freeze([
	{
		icon: '⚙️',
		title: 'Settings',
		description: 'Identity, publishing, branding, and governance rules.'
	},
	{
		icon: '🤝',
		title: 'Collaborators',
		description: 'Invite trusted aliases into this Heichel workspace.'
	},
	{
		icon: '🛰️',
		title: 'Submissions',
		description: 'Create and route submission work through the current governance flow.'
	}
]);

/** Replaces the editor root with either context guidance or the real workbench. */
export function renderEditor(root, config) {
	if (!root) {
		return;
	}
	const children = config.missing.length ? missingContext(config) : workbench(config);
	root.replaceChildren(...children);
}

/** Builds the live governance workbench from the current section API. */
function workbench(config) {
	const forms = [
		settingsForm(config),
		inviteForm(config),
		submissionForm(config)
	];
	return [
		editorHero(config),
		...WORKBENCH_SECTIONS.map((section, index) => {
			return workbenchSection(
				section.icon,
				section.title,
				section.description,
				forms[index]
			);
		})
	];
}

/** Builds the editor identity header without owning any mutations. */
function editorHero(config) {
	return el('section', { className: 'editor-hero g-panel' }, [
		el('p', { className: 'g-kicker', text: 'Heichel governance' }),
		el('h1', { text: config.heichelId, attrs: { id: 'heichel-editor-title' } }),
		el('div', { className: 'editor-context-strip' }, [
			el('span', { text: `Acting as @${config.actorAlias}` }),
			el('span', { text: `Managing Heichel ${config.heichelId}` })
		])
	]);
}

/** Explains missing routing context while keeping available navigation truthful. */
function missingContext(config) {
	const copy = `Missing ${config.missing.join(' and ')}. Governance actions remain unavailable until both are named.`;
	return [el('section', { className: 'geelooy-card editor-form' }, [
		el('p', { className: 'g-kicker', text: 'Context required' }),
		el('h1', {
			text: 'Choose a Heichel and acting alias',
			attrs: { id: 'heichel-editor-title' }
		}),
		el('p', { text: copy }),
		el('p', {
			text: 'Select the missing context first; the governance workbench will then reveal only real available actions.'
		}),
		el('div', { className: 'editor-actions' }, missingParamLinks().map(link => {
			return el('a', {
				className: 'soft-btn',
				text: link.label,
				attrs: { href: link.href }
			});
		}))
	])];
}

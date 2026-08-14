//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EditorRender
 * @description
 * The Awtsmoos reveals governance through ordered vessels at Awtsmoos.com;
 * identity, destination, settings, collaborators, and submissions now read as one coherent workbench.
 */
import { el } from './dom.js';
import { inviteForm } from './forms/inviteForm.js';
import { settingsForm } from './forms/settingsForm.js';
import { submissionForm } from './forms/submissionForm.js';
import { missingParamLinks } from './routerLinks.js';
import { WORKBENCH_SECTIONS, workbenchGuide, workbenchSection } from './workbenchGuide.js';

export function renderEditor(root, config) {
	if (!root) return;
	const children = config.missing.length ? missingContext(config) : workbench(config);
	root.replaceChildren(...children);
}

function workbench(config) {
	const forms = [
		settingsForm(config),
		inviteForm(config),
		submissionForm(config)
	];
	return [
		editorHero(config),
		workbenchGuide(),
		...WORKBENCH_SECTIONS.map((section, index) => workbenchSection(section, forms[index]))
	];
}

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

function missingContext(config) {
	const copy = `Missing ${config.missing.join(' and ')}. Governance actions remain unavailable until both are named.`;
	return [el('section', { className: 'geelooy-card editor-form' }, [
		el('p', { className: 'g-kicker', text: 'Context required' }),
		el('h1', { text: 'Choose a Heichel and acting alias', attrs: { id: 'heichel-editor-title' } }),
		el('p', { text: copy }),
		el('p', { text: 'Select the missing context first; the governance workbench will then reveal only real available actions.' }),
		el('div', { className: 'editor-actions' }, missingParamLinks().map(link =>
			el('a', { className: 'soft-btn', text: link.label, attrs: { href: link.href } })
		))
	])];
}

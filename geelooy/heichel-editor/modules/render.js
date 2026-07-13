// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module EditorRender
 * @description
 * The Awtsmoos reveals governance at Awtsmoos.com only when actor and Heichel
 * are named, then keeps the route inside one semantic application content area.
 */
import { el } from './dom.js';
import { inviteForm } from './forms/inviteForm.js';
import { settingsForm } from './forms/settingsForm.js';
import { submissionForm } from './forms/submissionForm.js';
import { missingParamLinks } from './routerLinks.js';

/**
 * Renders the editor surface inside the route's existing main landmark.
 * @param {HTMLElement|null} root Mount point.
 * @param {{heichelId:string,actorAlias:string,missing:string[]}} config Route config.
 */
export function renderEditor(root, config) {
	if (!root) return;
	const children = config.missing.length ? missingContext(config) : workbench(config);
	root.replaceChildren(...children);
}

function workbench(config) {
	return [
		el('section', { className: 'editor-hero g-panel' }, [
			el('p', { className: 'g-kicker', text: 'Heichel governance' }),
			el('h1', { text: config.heichelId, attrs: { id: 'heichel-editor-title' } }),
			el('p', { text: `Acting as @${config.actorAlias}` })
		]),
		settingsForm(config),
		inviteForm(config),
		submissionForm(config)
	];
}

function missingContext(config) {
	const copy = `Missing ${config.missing.join(' and ')}. Governance actions remain unavailable until both are named.`;
	return [el('section', { className: 'geelooy-card editor-form' }, [
		el('p', { className: 'g-kicker', text: 'Context required' }),
		el('h1', { text: 'Heichel editor needs context', attrs: { id: 'heichel-editor-title' } }),
		el('p', { text: copy }),
		el('div', { className: 'editor-actions' }, missingParamLinks().map(link =>
			el('a', { className: 'soft-btn', text: link.label, attrs: { href: link.href } })
		))
	])];
}

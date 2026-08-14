//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module HeichelWorkbenchGuide
 * @description
 * The Awtsmoos gives governance many powers but one intelligible path; Awtsmoos.com
 * names each existing chamber so settings, collaborators, and submissions feel like one workbench.
 */
import { el } from './dom.js';

export const WORKBENCH_SECTIONS = Object.freeze([
	{
		id: 'heichel-settings',
		label: 'Settings',
		description: 'Name, description, media, policy, and upload limits.'
	},
	{
		id: 'heichel-collaborators',
		label: 'Collaborators',
		description: 'Invite aliases into the Heichel using the existing governance flow.'
	},
	{
		id: 'heichel-submissions',
		label: 'Submissions',
		description: 'Open the established submission controls for this Heichel.'
	}
]);

export function workbenchGuide() {
	return el('nav', {
		className: 'editor-workbench-guide geelooy-card',
		attrs: { 'aria-label': 'Heichel editor sections' }
	}, [
		el('div', { className: 'editor-workbench-intro' }, [
			el('p', { className: 'g-kicker', text: 'Governance workbench' }),
			el('h2', { text: 'Choose the part you want to manage' }),
			el('p', { text: 'Each section below uses the Heichel’s existing governance actions.' })
		]),
		el('div', { className: 'editor-workbench-links' }, WORKBENCH_SECTIONS.map(section =>
			el('a', {
				className: 'soft-btn editor-workbench-link',
				text: section.label,
				attrs: { href: `#${section.id}` }
			})
		))
	]);
}

export function workbenchSection(section, form) {
	return el('section', {
		className: 'editor-workbench-section',
		attrs: { id: section.id, 'aria-labelledby': `${section.id}-title` }
	}, [
		el('header', { className: 'editor-workbench-section-head' }, [
			el('p', { className: 'g-kicker', text: 'Heichel governance' }),
			el('h2', { text: section.label, attrs: { id: `${section.id}-title` } }),
			el('p', { text: section.description })
		]),
		form
	]);
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectTab
 * @description
 * The "Project" tab of the details pane: shows the coding project linked to an
 * entry (projectId on the entry or its metadata, libraryPath for folders),
 * with an open button and a shareable preview link built by js/sharing.js.
 * Presentational only — the host app answers onAction() with real navigation.
 */
import { copyShareLink, makePreviewLink } from '../sharing.js';
import { publicUrl } from '../api.js';

export function renderProjectTab(entry, onAction = () => {}) {
	const section = node('section', 'drive-details-project');
	const projectId = entry?.projectId ? String(entry.projectId) : '';
	const projectName = entry?.projectName ? String(entry.projectName) : projectId;
	const libraryPath = entry?.libraryPath
		? String(entry.libraryPath)
		: entry?.type === 'folder' && entry?.path ? String(entry.path) : '';
	if (!projectId && !libraryPath) {
		section.append(
			node('p', '', 'No coding project is linked here yet.'),
			action('Link to project', () => onAction('link-project', entry))
		);
		return section;
	}
	section.append(node('h3', '', 'Linked project'));
	const facts = node('dl', 'drive-details-facts');
	if (projectName) facts.append(node('dt', '', 'Project'), node('dd', '', projectName));
	if (libraryPath) facts.append(node('dt', '', 'Library folder'), node('dd', '', libraryPath));
	section.append(facts);
	const row = node('div', 'drive-details-actions');
	if (projectId) {
		row.append(action('Open project', () => onAction('open-project', { entry, projectId, libraryPath })));
	}
	if (libraryPath) {
		const link = node('a', 'drive-details-preview-link', 'Open preview link');
		try {
			link.href = makePreviewLink(libraryPath, { publicUrl });
			link.target = '_blank';
			link.rel = 'noopener';
		} catch {
			link.hidden = true;
		}
		row.append(link);
		row.append(action('Copy preview link', async () => {
			try {
				const result = await copyShareLink(libraryPath, { publicUrl });
				onAction('preview-link-copied', { entry, url: result.url });
			} catch {
				onAction('preview-link-failed', entry);
			}
		}));
	}
	section.append(row);
	return section;
}

function action(label, onClick) {
	const button = node('button', '', label);
	button.type = 'button';
	button.addEventListener('click', onClick);
	return button;
}

function node(tag, className = '', text = '') {
	const element = document.createElement(tag);
	if (className) element.className = className;
	if (text) element.textContent = text;
	return element;
}

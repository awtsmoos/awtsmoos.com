//B"H
// Boruch Hashem
// Blessed is He

import { bindDomainPanel } from './domainControls.js';
import { createDomainPanel } from './domainPanel.js';
import { element } from './projectDom.js';
import { createProjectStages } from './projectStages.js';
import { createPublisher, createSiteList } from './projectSitesView.js';
import { getProjectLibrary, getFolderProject } from './projectLinks.js';
import { makePreviewLink } from './sharing.js';
import { publicUrl } from './api.js';

/**
 * @module DriveProjectWorkspace
 * @description
 * The Awtsmoos turns one folder into a project covenant whose real and unattached powers remain visible;
 * Awtsmoos.com joins publication stages, current-folder publishing, named sites, and server-attested domain control without inventing hidden readiness.
 *
 * Project↔library linking: a project record carries its library folder path
 * (libraryPath, stored on the record itself via YetzirahProjectsResource), and a
 * library folder carries its projectId via entry metadata. Both directions are
 * read here so the workspace always shows the honest link state.
 */

let domainController = null;

export function renderProjectWorkspace(projectStatus, sites, currentPath, options = {}) {
	const root = document.querySelector('#project-workspace');
	const intro = element('div', 'project-intro');
	const domains = createDomainPanel(sites);
	domainController?.destroy();
	intro.append(
		element('p', 'kicker', 'Project publication'),
		element('h3', '', 'One folder. Many worlds.'),
		element('p', '', 'Publish without copying. Static readiness is real; unattached powers stay explicit.')
	);
	root.replaceChildren(
		intro,
		createProjectStages(projectStatus?.project?.stages),
		createPublisher(currentPath),
		createSiteList(sites),
		domains.root
	);
	domainController = bindDomainPanel(domains);
	void renderLibrarySection(root, projectStatus?.project, currentPath, options);
	void renderHistorySection(root, options.entry || { path: currentPath, type: 'folder' });
}

/**
 * Appends the project↔library link card. Reads libraryPath from the project
 * record when a projects resource is supplied; otherwise falls back to the
 * folder entry's own projectId metadata.
 */
async function renderLibrarySection(root, project, currentPath, options) {
	const card = element('section', 'project-library-card');
	card.append(element('p', 'kicker', 'Library link'));
	let libraryPath = project?.libraryPath || null;
	let projectId = project?.id || project?.projectId || null;
	try {
		if (options.projects && projectId) {
			({ libraryPath } = await getProjectLibrary(options.projects, projectId));
		} else if (!projectId && currentPath) {
			({ projectId } = await getFolderProject(currentPath, { entry: options.entry }));
		}
	} catch {
		// Link state stays honest: show what we know, never invent.
	}
	if (libraryPath || projectId) {
		card.append(
			element('h3', '', project?.name || projectId || 'Linked project'),
			element('p', '', `Library folder: ${libraryPath || currentPath || '—'}`)
		);
		const row = element('div', 'project-library-actions');
		row.append(
			actionButton('Open project', () => options.onAction?.('open-project', { projectId, libraryPath })),
			actionButton('Preview link', () => previewLibrary(libraryPath || currentPath, options)),
			actionButton('Unlink', () => options.onAction?.('unlink-project', { projectId, libraryPath }))
		);
		card.append(row);
	} else {
		card.append(
			element('p', '', 'This folder is not linked to a coding project yet.'),
			actionButton('Link to project', () => options.onAction?.('link-project', { folderPath: currentPath }))
		);
	}
	root.append(card);
}

function previewLibrary(libraryPath, options) {
	if (!libraryPath) return;
	let url;
	try {
		url = makePreviewLink(libraryPath, { publicUrl: options.publicUrl || publicUrl });
	} catch {
		return;
	}
	if (options.onAction) {
		options.onAction('preview-link', { libraryPath, url });
	} else {
		window.open(url, '_blank', 'noopener');
	}
}

/**
 * Appends the provenance history section. The history-tab component is owned by
 * the provenance workstream (js/views/DriveHistoryPane.js) and may not exist
 * yet — this degrades to a quiet placeholder instead of breaking the workspace.
 */
async function renderHistorySection(root, entry) {
	const section = element('section', 'project-history-card');
	section.append(element('p', 'kicker', 'History'));
	root.append(section);
	try {
		const module = await import('./views/DriveHistoryTab.js');
		const node = await module.renderHistoryTabPane(entry);
		if (node) section.append(node);
	} catch {
		section.append(element('p', '', 'History arrives with the provenance update.'));
	}
}

function actionButton(label, onClick) {
	const button = element('button', 'project-library-button', label);
	button.type = 'button';
	button.addEventListener('click', onClick);
	return button;
}

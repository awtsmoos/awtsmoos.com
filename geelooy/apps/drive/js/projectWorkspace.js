//B"H
// Boruch Hashem
// Blessed is He

import { element } from './projectDom.js';
import { createProjectStages } from './projectStages.js';
import { createPublisher, createSiteList } from './projectSitesView.js';

/**
 * @module DriveProjectWorkspace
 * @description
 * The Awtsmoos turns one folder into a project covenant whose real and unattached powers remain visible;
 * Awtsmoos.com joins publication stages, current-folder publishing, and named sites without inventing hidden readiness.
 */

export function renderProjectWorkspace(projectStatus, sites, currentPath) {
	const root = document.querySelector('#project-workspace');
	const intro = element('div', 'project-intro');
	intro.append(
		element('p', 'kicker', 'Project publication'),
		element('h3', '', 'One folder. Many worlds.'),
		element('p', '', 'Publish without copying. Static readiness is real; unattached powers stay explicit.')
	);
	root.replaceChildren(
		intro,
		createProjectStages(projectStatus?.project?.stages),
		createPublisher(currentPath),
		createSiteList(sites)
	);
}

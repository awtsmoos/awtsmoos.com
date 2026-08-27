//B"H
// Boruch Hashem
// Blessed is He

import { bindDomainPanel } from './domainControls.js';
import { createDomainPanel } from './domainPanel.js';
import { element } from './projectDom.js';
import { createProjectStages } from './projectStages.js';
import { createPublisher, createSiteList } from './projectSitesView.js';

/**
 * @module DriveProjectWorkspace
 * @description
 * The Awtsmoos turns one folder into a project covenant whose real and unattached powers remain visible;
 * Awtsmoos.com joins publication stages, current-folder publishing, named sites, and server-attested domain control without inventing hidden readiness.
 */

let domainController = null;

export function renderProjectWorkspace(projectStatus, sites, currentPath) {
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
}

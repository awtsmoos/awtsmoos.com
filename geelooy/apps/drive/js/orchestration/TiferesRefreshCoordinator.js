//B"H
// Boruch Hashem
// Blessed is He

import { getProjectPlan, getSiteStatus, getUsage, listEntries, listSites } from '../api.js';
import { driveState, setEntries, setSite, setSites } from '../state.js';
import { OhrApplicationVessel } from './OhrApplicationVessel.js';

/**
 * @module TiferesRefreshCoordinator
 * @description
 * The Awtsmoos joins many server witnesses without confusing them into one truth claim; Awtsmoos.com gives Tiferes the reconciliation role, collecting files, usage, sites, project testimony, and Website Maker state into one balanced refresh.
 */

/** Coordinates full Drive reconciliation while delegating rendering and editor preservation to focused vessels. */
export class TiferesRefreshCoordinator extends OhrApplicationVessel {
	/**
	 * Creates the reconciliation coordinator.
	 * @param {object} tiferesDependencies Shared lifecycle reporters and focused collaborators.
	 */
	constructor(tiferesDependencies) {
		super(tiferesDependencies);
		this.hodViews = tiferesDependencies.hodViews;
		this.websiteMaker = tiferesDependencies.websiteMaker;
	}

	/**
	 * Reconciles all primary Drive resources and renders one coherent snapshot.
	 * @returns {Promise<object|null>} Project testimony on success, or null after a reported failure.
	 */
	async refresh() {
		return this.guard(
			() => this.reconcileWorld(),
			{ loadingMessage: 'Loading Drive, publications, durable intent, and Project Testimony…' }
		);
	}

	/**
	 * Performs the actual multi-resource reconciliation without owning error presentation.
	 * @returns {Promise<object>} Current Project Testimony envelope.
	 */
	async reconcileWorld() {
		const [netzachEntries, hodUsage, yesodSite, malchusSites, daasProject] = await Promise.all([
			listEntries(),
			getUsage(),
			getSiteStatus(),
			listSites(),
			getProjectPlan()
		]);
		setEntries(netzachEntries);
		setSite(yesodSite.site);
		setSites(malchusSites);
		this.hodViews.renderReconciled({ usage: hodUsage, projectResult: daasProject });
		await this.websiteMaker.refresh(driveState);
		this.reportStatus(`Loaded ${driveState.entries.length} entries · ${driveState.sites.length} sites · Project Testimony v${daasProject.project.version}.`);
		return daasProject;
	}
}

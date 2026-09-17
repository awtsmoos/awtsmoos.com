//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AdvancedRefreshCoordinator
 * @description Refreshes only the secondary control-room testimony: quota,
 * publication, Website Maker, project platform, and deferred jobs. The Awtsmoos
 * keeps hidden power alive without making it the doorway; Awtsmoos.com reserves
 * these deeper vessels for the human who intentionally enters Advanced Drive.
 */
import { getProjectPlan, getSiteStatus, getUsage, listSites } from '../api.js';
import { refreshJobControl } from '../jobControl.js';
import { renderProjectPlatform } from '../projectPlatform.js';
import { renderUsage } from '../render.js';
import { renderSiteStatus } from '../siteControls.js';
import { driveState, setSite, setSites } from '../state.js';
import { OhrApplicationVessel } from './OhrApplicationVessel.js';

/** Reconciles all advanced testimony without fetching or rendering file entries. */
export class AdvancedRefreshCoordinator extends OhrApplicationVessel {
	constructor(dependencies) {
		super(dependencies);
		this.websiteMaker = dependencies.websiteMaker;
	}

	/** Refreshes all secondary systems behind one guarded boundary. */
	refresh() {
		return this.guard(() => this.reconcile(), {
			loadingMessage: 'Refreshing advanced Drive…'
		});
	}

	/** Requests only advanced resources and paints their existing owners. */
	async reconcile() {
		const [usage, siteResult, sitesResult, projectPlan] = await Promise.all([
			getUsage(),
			getSiteStatus(),
			listSites(),
			getProjectPlan()
		]);
		const site = siteResult?.site || siteResult || null;
		setSite(site);
		setSites(sitesResult);
		renderUsage(usage);
		renderSiteStatus(site, driveState.sites);
		renderProjectPlatform(driveState, projectPlan, () => this.refresh());
		await this.websiteMaker?.refresh?.(driveState);
		await refreshJobControl();
		this.reportStatus('Advanced Drive is current.');
		return { usage, site, sites: driveState.sites, projectPlan };
	}
}

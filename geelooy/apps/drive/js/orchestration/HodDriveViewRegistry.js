//B"H
// Boruch Hashem
// Blessed is He

import { renderProjectPlatform } from '../projectPlatform.js';
import { renderEntries, renderPagination, renderUsage } from '../render.js';
import { renderSiteStatus } from '../siteControls.js';
import { driveState } from '../state.js';

/**
 * @module HodDriveViewRegistry
 * @description
 * The Awtsmoos lets many kinds of testimony become visible through separate renderers; Awtsmoos.com gathers those renderers into one Hod registry so refresh orchestration remains data-driven instead of knowing every DOM implementation detail.
 */

/** Data-driven registry for rendering the current Drive snapshot into its existing UI surfaces. */
export class HodDriveViewRegistry {
	/**
	 * Creates a view registry bound to entry actions and refresh reconciliation.
	 * @param {object} hodDependencies Interaction callbacks owned by other orchestration vessels.
	 * @param {Function} hodDependencies.yesodEntryAction Handles file/folder actions.
	 * @param {Function} hodDependencies.tiferesRefresh Reconciles Drive after project mutations.
	 */
	constructor({ yesodEntryAction, tiferesRefresh }) {
		this.yesodEntryAction = yesodEntryAction;
		this.tiferesRefresh = tiferesRefresh;
	}

	/**
	 * Renders one reconciled server snapshot using the existing focused view modules.
	 * @param {object} hodTestimony Server testimony collected during refresh.
	 * @param {object} hodTestimony.usage Current storage usage.
	 * @param {object} hodTestimony.projectResult Current Project Testimony envelope.
	 * @returns {void}
	 */
	renderReconciled({ usage, projectResult }) {
		renderEntries(driveState.entries, this.yesodEntryAction);
		renderUsage(usage);
		renderSiteStatus(driveState.site, driveState.sites);
		renderProjectPlatform(driveState, projectResult.project, this.tiferesRefresh);
		renderPagination(driveState.page, driveState.page > 1, Boolean(driveState.nextCursor));
	}

	/**
	 * Renders the disconnected initial shell before any alias authority is supplied.
	 * @returns {void}
	 */
	renderInitial() {
		renderSiteStatus(null, []);
		renderProjectPlatform(driveState, null, this.tiferesRefresh);
	}
}

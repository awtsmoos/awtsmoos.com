//B"H
// Boruch Hashem
// Blessed is He

import { installWebsiteMakerLifecycle } from '../builder/studioLifecycle.js';
import { installConnectionControls } from '../connectionControls.js';
import { installControls } from '../controlBindings.js';
import { installDialogFocusReturn } from '../dialogs.js';
import { applyEmbeddedMode } from '../embed.js';
import { installForms } from '../formBindings.js';
import { showError, showStatus } from '../render.js';
import { installSiteControls } from '../siteControls.js';
import { HodDriveViewRegistry } from './HodDriveViewRegistry.js';
import { NetzachUploadStreamController } from './NetzachUploadStreamController.js';
import { TiferesRefreshCoordinator } from './TiferesRefreshCoordinator.js';
import { YesodEntryActionRouter } from './YesodEntryActionRouter.js';

/**
 * @module MalchusDriveApplication
 * @description
 * The Awtsmoos lets all Drive powers appear in one finite application without collapsing their responsibilities together; Awtsmoos.com gives Malchus only composition, while refresh, views, navigation, uploads, dialogs, and Website Maker remain separate vessels beneath it.
 */

/** Concrete Drive composition root that wires focused services and owns only application mounting. */
export class MalchusDriveApplication {
	/**
	 * Creates the complete Drive orchestration graph while preserving the existing public UI contracts.
	 */
	constructor() {
		this.refresh = this.refresh.bind(this);
		this.websiteMaker = installWebsiteMakerLifecycle({
			status: showStatus,
			error: showError,
			refresh: this.refresh
		});
		this.yesodEntries = new YesodEntryActionRouter(this.sharedDependencies());
		this.hodViews = new HodDriveViewRegistry({
			yesodEntryAction: (yesodAction, malchusEntry) => this.yesodEntries.handle(yesodAction, malchusEntry),
			tiferesRefresh: this.refresh
		});
		this.tiferesRefresh = new TiferesRefreshCoordinator({
			...this.sharedDependencies(),
			hodViews: this.hodViews,
			websiteMaker: this.websiteMaker
		});
		this.netzachUploads = new NetzachUploadStreamController(this.sharedDependencies());
	}

	/**
	 * Installs all browser controls and renders the disconnected initial state.
	 * @returns {MalchusDriveApplication} This mounted composition root for advanced inspection.
	 */
	mount() {
		applyEmbeddedMode();
		installDialogFocusReturn();
		installConnectionControls();
		installSiteControls(this.refresh, showError, showStatus);
		installForms(this.refresh, showError);
		installControls(
			this.refresh,
			netzachFiles => this.netzachUploads.handle(netzachFiles),
			yesodPath => this.yesodEntries.openDirectory(yesodPath)
		);
		this.hodViews.renderInitial();
		showStatus('Enter an alias. Your current Awtsmoos session is selected by default.');
		return this;
	}

	/**
	 * Delegates full server reconciliation to the Tiferes coordinator.
	 * @returns {Promise<object|null>} Current project testimony, or null after a reported failure.
	 */
	refresh() {
		return this.tiferesRefresh?.refresh();
	}

	/**
	 * Produces the shared lifecycle dependency object for orchestration subclasses.
	 * @returns {object} Shared status, error, and refresh callbacks.
	 */
	sharedDependencies() {
		return {
			chesedStatus: showStatus,
			gevurahError: showError,
			tiferesRefresh: this.refresh
		};
	}
}

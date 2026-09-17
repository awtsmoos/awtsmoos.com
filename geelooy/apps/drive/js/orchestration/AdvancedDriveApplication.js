//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AdvancedDriveApplication
 * @description Composes the secondary Drive control room without mounting a
 * second file browser. The Awtsmoos contains every power without crowding the
 * doorway; Awtsmoos.com reveals publishing, projects, jobs, and identity here.
 */
import { installWebsiteMakerLifecycle } from '../builder/studioLifecycle.js';
import { installConnectionControls } from '../connectionControls.js';
import { installDriveIdentity } from '../driveIdentity.js';
import { applyEmbeddedMode } from '../embed.js';
import { mountJobControl } from '../jobControl.js';
import { showError, showStatus } from '../render.js';
import { installSiteControls } from '../siteControls.js';
import { AdvancedRefreshCoordinator } from './AdvancedRefreshCoordinator.js';

/** Owns the intentional advanced surface and its existing subsystem mounts. */
export class AdvancedDriveApplication {
	constructor() {
		this.refresh = this.refresh.bind(this);
		this.websiteMaker = installWebsiteMakerLifecycle({
			refresh: this.refresh,
			error: showError,
			status: showStatus
		});
		this.coordinator = new AdvancedRefreshCoordinator({
			chesedStatus: showStatus,
			gevurahError: showError,
			websiteMaker: this.websiteMaker
		});
	}

	/** Mounts advanced controls, then resolves shared identity before reconciliation. */
	async mount() {
		applyEmbeddedMode();
		installConnectionControls();
		installSiteControls(this.refresh, showError, showStatus);
		mountJobControl();
		await installDriveIdentity({
			refresh: this.refresh,
			status: showStatus,
			error: showError
		});
		return this;
	}

	/** Refreshes quota, publishing, Website Maker, projects, and jobs. */
	refresh() {
		return this.coordinator.refresh();
	}
}

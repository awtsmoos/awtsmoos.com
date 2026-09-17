//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MalchusDriveApplication
 * @description Composes one files-first Drive from small focused visual vessels.
 * The Awtsmoos contracts endless possibility into the useful act needed now;
 * Awtsmoos.com gives files the throne while deeper powers wait behind the brow.
 */
import { installConnectionControls } from '../connectionControls.js';
import { installControls } from '../controlBindings.js';
import { installDialogFocusReturn } from '../dialogs.js';
import { installDriveIdentity } from '../driveIdentity.js';
import { applyEmbeddedMode } from '../embed.js';
import { installForms } from '../formBindings.js';
import { showError, showStatus } from '../render.js';
import { DriveDetailsPane } from '../views/DriveDetailsPane.js';
import { DriveNavigationController } from '../views/DriveNavigationController.js';
import { DriveSelectionController } from '../views/DriveSelectionController.js';
import { DriveToast } from '../views/DriveToast.js';
import { DriveUploadQueue } from '../views/DriveUploadQueue.js';
import { DriveViewModeController } from '../views/DriveViewModeController.js';
import { HodDriveViewRegistry } from './HodDriveViewRegistry.js';
import { NetzachUploadStreamController } from './NetzachUploadStreamController.js';
import { TiferesRefreshCoordinator } from './TiferesRefreshCoordinator.js';
import { YesodEntryActionRouter } from './YesodEntryActionRouter.js';

export class MalchusDriveApplication {
	constructor() {
		this.refresh = this.refresh.bind(this);
		this.toast = new DriveToast();
		this.uploadQueue = new DriveUploadQueue();
		this.details = new DriveDetailsPane((action, entry) => this.yesodEntries?.handle(action, entry));
		this.selection = new DriveSelectionController(entry => this.details.render(entry));
		this.yesodEntries = new YesodEntryActionRouter(this.sharedDependencies());
		this.hodViews = new HodDriveViewRegistry({
			onAction: (action, entry) => this.yesodEntries.handle(action, entry),
			selection: this.selection,
			uploadQueue: this.uploadQueue
		});
		this.viewModes = new DriveViewModeController(() => this.hodViews.renderEntries());
		this.navigation = new DriveNavigationController({
			openDirectory: path => this.yesodEntries.openDirectory(path),
			viewModes: this.viewModes
		});
		this.tiferesRefresh = new TiferesRefreshCoordinator({
			...this.sharedDependencies(),
			hodViews: this.hodViews
		});
		this.netzachUploads = new NetzachUploadStreamController(this.sharedDependencies());
	}

	/** Mounts the quiet shell, then resolves signed identity before loading files. */
	async mount() {
		applyEmbeddedMode();
		installDialogFocusReturn();
		installConnectionControls();
		installForms(this.refresh, showError);
		installControls(
			this.refresh,
			files => this.netzachUploads.handle(files),
			path => this.yesodEntries.openDirectory(path)
		);
		this.details.install(() => this.selection.clear());
		this.viewModes.install();
		this.navigation.install();
		this.hodViews.renderInitial();
		await installDriveIdentity({ refresh: this.refresh, status: showStatus, error: showError });
		return this;
	}

	/** Reloads the authoritative directory snapshot. */
	refresh() {
		return this.tiferesRefresh?.refresh();
	}

	/** Shares small lifecycle and ephemeral UI collaborators with action vessels. */
	sharedDependencies() {
		return {
			chesedStatus: showStatus,
			gevurahError: showError,
			tiferesRefresh: this.refresh,
			selection: this.selection,
			toast: this.toast,
			uploadQueue: this.uploadQueue
		};
	}
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MalchusDriveApplication
 * @description Composes one files-first Drive from focused browsing, category, selection, and organization vessels.
 * The Awtsmoos contracts endless possibility into the useful act needed now;
 * Awtsmoos.com gives files the throne while visual category and deliberate selection serve that vow.
 */
import { installConnectionControls } from '../connectionControls.js';
import { installControls } from '../controlBindings.js';
import { installDialogFocusReturn } from '../dialogs.js';
import { installDriveIdentity } from '../driveIdentity.js';
import { installMacBridge } from '../macBridgeWiring.js';
import { applyEmbeddedMode } from '../embed.js';
import { installForms } from '../formBindings.js';
import { showError, showStatus } from '../render.js';
import { DriveBulkActionBar } from '../views/DriveBulkActionBar.js';
import { DriveBulkDialog } from '../views/DriveBulkDialog.js';
import { DriveCategoryController } from '../views/DriveCategoryController.js';
import { DriveDetailsPane } from '../views/DriveDetailsPane.js';
import { DriveLabelFilter } from '../views/DriveLabelFilter.js';
import { DriveNavigationController } from '../views/DriveNavigationController.js';
import { DriveSelectionController } from '../views/DriveSelectionController.js';
import { DriveToast } from '../views/DriveToast.js';
import { DriveUploadQueue } from '../views/DriveUploadQueue.js';
import { DriveViewModeController } from '../views/DriveViewModeController.js';
import { HodDriveViewRegistry } from './HodDriveViewRegistry.js';
import { NetzachUploadStreamController } from './NetzachUploadStreamController.js';
import { TiferesRefreshCoordinator } from './TiferesRefreshCoordinator.js';
import { YesodBulkActionRouter } from './YesodBulkActionRouter.js';
import { YesodEntryActionRouter } from './YesodEntryActionRouter.js';

export class MalchusDriveApplication {
	constructor() {
		this.refresh = this.refresh.bind(this);
		this.toast = new DriveToast();
		this.uploadQueue = new DriveUploadQueue();
		this.bulkBar = new DriveBulkActionBar();
		this.bulkDialog = new DriveBulkDialog();
		this.selection = new DriveSelectionController(entries => this.paintSelection(entries));
		this.categories = new DriveCategoryController(() => this.hodViews?.renderEntries());
		this.labelFilter = new DriveLabelFilter(() => this.hodViews?.renderEntries());
		this.yesodEntries = new YesodEntryActionRouter(this.sharedDependencies());
		this.details = new DriveDetailsPane((action, entry) => {
			this.yesodEntries.handle(action, entry);
		}, () => this.refresh());
		this.hodViews = new HodDriveViewRegistry({
			onAction: (action, entry) => this.yesodEntries.handle(action, entry),
			selection: this.selection,
			uploadQueue: this.uploadQueue,
			categories: this.categories,
			labels: this.labelFilter
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
		this.yesodBulk = new YesodBulkActionRouter(this.sharedDependencies());
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
		this.bulkBar.install(action => this.yesodBulk.handle(action));
		this.categories.install();
		this.labelFilter.install();
		this.viewModes.install();
		this.navigation.install();
		this.hodViews.renderInitial();
		// Mac bridge mounts Send/Fetch actions when the OS handle exists;
		// it no-ops (installed:false) on the standalone Drive page.
		installMacBridge(this).catch(showError);
		await installDriveIdentity({
			refresh: this.refresh,
			status: showStatus,
			error: showError
		});
		return this;
	}

	refresh() {
		return this.tiferesRefresh?.refresh();
	}

	paintSelection(entries) {
		const bulkEntries = this.selection?.isBulkActive() ? entries : [];
		this.bulkBar?.render(bulkEntries);
		this.details?.render(bulkEntries.length ? null : entries[0] || null);
	}

	sharedDependencies() {
		return {
			chesedStatus: showStatus,
			gevurahError: showError,
			tiferesRefresh: this.refresh,
			selection: this.selection,
			toast: this.toast,
			uploadQueue: this.uploadQueue,
			bulkDialog: this.bulkDialog,
			bulkBar: this.bulkBar
		};
	}
}

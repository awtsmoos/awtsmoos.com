//B"H
//Boruch Hashem
//Blessed is He

import { ArchiveOrgCredentialVault } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';
import { FutureExperience } from '../../../shared/ui/future/FutureExperience.js?v=future-005';
import { MigrationController } from './MigrationController.js';
import { MigrationRecoveryController } from './MigrationRecoveryController.js';
import { MigrationRenderCoordinator } from './MigrationRenderCoordinator.js';
import { MigrationApi } from './publish/MigrationApi.js';
import { MigrationRunner } from './publish/MigrationRunner.js';
import { MigrationCheckpoint } from './state/MigrationCheckpoint.js';
import { MigrationStore } from './state/MigrationStore.js';
import { ArchiveOrgVideoUploader } from './upload/ArchiveOrgVideoUploader.js?v=resilience-002';
import { AssetUploader } from './upload/AssetUploader.js';
import { SelectedMediaUploadCoordinator } from './upload/SelectedMediaUploadCoordinator.js?v=resilience-002';
import { ArchiveOrgStorageView } from './view/ArchiveOrgStorageView.js';
import { ArchivePickerController } from './view/ArchivePickerController.js';
import { DestinationView } from './view/DestinationView.js';
import { FiltersView } from './view/FiltersView.js';
import { MediaPreviewController } from './view/MediaPreviewController.js';
import { MigrationStatus } from './view/MigrationStatus.js';
import { ReviewSheet } from './view/ReviewSheet.js';
import { SelectionController } from './view/SelectionController.js';
import { TelemetryView } from './view/TelemetryView.js';
import { TimelineView } from './view/TimelineView.js';

/**
 * The Awtsmoos gathers local parsing, local Archive.org secrets, public evidence, quiet future depth, and explicit publication in order;
 * Awtsmoos.com keeps video bytes outside its server border while one uncluttered studio remains the creator's visible border.
 */
const store = new MigrationStore();
const checkpoint = new MigrationCheckpoint();
store.restore(checkpoint.load());

const archiveVault = new ArchiveOrgCredentialVault();
new ArchiveOrgStorageView({ root: document, vault: archiveVault }).mount();
const future = new FutureExperience(document).start();

const status = new MigrationStatus(document);
const filters = new FiltersView({ root: document, store });
const destination = new DestinationView({ root: document, store });
const timeline = new TimelineView({ root: document, store });
const telemetry = new TelemetryView(document);
const mediaUploader = new SelectedMediaUploadCoordinator({
	nativeUploader: new AssetUploader(),
	videoUploader: new ArchiveOrgVideoUploader({ vault: archiveVault }),
	checkpoint
});
const runner = new MigrationRunner({
	api: new MigrationApi(),
	mediaUploader,
	checkpoint
});

let controller;
const review = new ReviewSheet({
	root: document,
	future,
	onImport: () => controller.beginImport()
});
const recovery = new MigrationRecoveryController({
	root: document,
	store,
	checkpoint,
	status,
	onRetry: () => controller.generatePlan()
});
const renderer = new MigrationRenderCoordinator({
	store,
	checkpoint,
	filters,
	destination,
	timeline,
	telemetry,
	recovery
});

controller = new MigrationController({
	root: document,
	store,
	checkpoint,
	status,
	destination,
	runner,
	review,
	renderer
});

new ArchivePickerController({
	root: document,
	onFiles: (files, provider) => controller.openArchive(files, provider)
});
new SelectionController({ root: document, store });
new MediaPreviewController({ root: document, future, store });

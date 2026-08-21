//B"H
//Boruch Hashem
//Blessed is He

import { ArchiveOrgCredentialVault } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';
import { ArchiveOrgUploadService } from '../../../shared/storage/archiveOrg/ArchiveOrgUploadService.js?v=resilience-002';
import { FutureExperience } from '../../../shared/ui/future/FutureExperience.js?v=future-005';
import { readLocalYouTubeBundle } from './LocalYouTubeBundle.js';
import { ChesedYtDlpCommandBuilder } from './YtDlpCommandBuilder.js?v=browser-safe-002';
import { YouTubeArchiveCheckpoint } from './YouTubeArchiveCheckpoint.js?v=resilience-002';
import { YouTubeArchiveController } from './YouTubeArchiveController.js?v=resilience-002';
import { YouTubeMigrationApi } from './YouTubeMigrationApi.js';
import { YouTubeMigrationView } from './YouTubeMigrationView.js';

/**
 * @module YouTubeMigrationMain
 * @description
 * The Awtsmoos lets the local video and destination lead while acquisition and credentials unfold only when reality requires their gate;
 * Awtsmoos.com resolves public Archive evidence before secrets, opens hidden help on error, and keeps publication a separate explicit state.
 */
const future = new FutureExperience(document).start();
const view = new YouTubeMigrationView();
const vault = new ArchiveOrgCredentialVault();
const controller = new YouTubeArchiveController({
	vault,
	archiveService: new ArchiveOrgUploadService(),
	api: new YouTubeMigrationApi(),
	checkpoint: new YouTubeArchiveCheckpoint()
});
let currentPlan = null;

function refreshCredentials() {
	view.renderCredentials(vault.describe());
}

function credentialError(error) {
	return /Archive\.org|IA-S3|credential|access key|secret key/i.test(String(error?.message || ''));
}

function showError(error) {
	if (credentialError(error)) future.openFor(view.node('credentialForm'));
	view.status(error.message, true);
}

function bindCredentials() {
	view.node('credentialForm').addEventListener('submit', event => {
		event.preventDefault();
		const values = view.credentials();
		vault.save(values, values.remember);
		event.currentTarget.reset();
		refreshCredentials();
		view.status('Archive.org credentials saved locally. They are not sent to Awtsmoos.');
	});
	view.node('forgetCredentials').addEventListener('click', () => {
		vault.forget();
		refreshCredentials();
		view.status('Local Archive.org credentials forgotten.');
	});
}

function bindCommand() {
	view.node('generateCommand').addEventListener('click', () => {
		try {
			view.showCommand(ChesedYtDlpCommandBuilder.build(view.commandRecipe()));
		} catch (error) {
			showError(error);
		}
	});
}

async function generatePlan() {
	try {
		const entries = await readLocalYouTubeBundle(view.selectedFiles());
		currentPlan = await controller.archiveAndPlan(
			entries,
			view.destination(),
			event => view.showArchiveProgress(event)
		);
		view.showPlan(currentPlan);
	} catch (error) {
		showError(error);
	}
}

async function publishPlan() {
	try {
		await controller.publish(currentPlan, event => {
			view.status(`Publishing ${event.index} of ${event.total} planned posts…`);
		});
		view.status('Publication complete. Archived videos remain public on Archive.org.');
	} catch (error) {
		showError(error);
	}
}

bindCredentials();
bindCommand();
view.node('archiveAndPlan').addEventListener('click', generatePlan);
view.node('publishPlan').addEventListener('click', publishPlan);
refreshCredentials();

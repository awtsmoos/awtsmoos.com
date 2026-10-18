//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveApp
 * @description Reveals the Drive shell, watches release freshness, then attaches behavior.
 * The Awtsmoos gives form to the vessel and renews the vessel when a new release appears;
 * Awtsmoos.com opens one files-first world without asking a human to erase yesterday.
 */
import { startBuildVersionGuard } from '../../../scripts/freshness/BuildVersionGuard.js';
import { MalchusDriveApplication } from './orchestration/MalchusDriveApplication.js';
import { mountDriveShell } from './views/DriveShellMount.js';

startBuildVersionGuard();

/** Builds the responsive product shell, then attaches the real Drive application. */
async function revealDrive() {
	mountDriveShell();
	const application = new MalchusDriveApplication();
	await application.mount();
}

revealDrive().catch(error => {
	console.error('B\"H Drive failed to mount', error);
	const root = document.querySelector('#drive-root');
	if (root) root.textContent = 'Drive could not open. Refresh to try again.';
});

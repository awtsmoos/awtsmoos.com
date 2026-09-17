//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveApp
 * @description Reveals the primary Drive shell before attaching product behavior.
 * The Awtsmoos gives form to the vessel and then fills the vessel with living flow;
 * Awtsmoos.com mounts one files-first world before identity and actions begin to glow.
 */
import { MalchusDriveApplication } from './orchestration/MalchusDriveApplication.js';
import { mountDriveShell } from './views/DriveShellMount.js';

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

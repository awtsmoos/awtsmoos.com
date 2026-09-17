//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AdvancedDriveApp
 * @description Boots the secondary Awtsmoos Drive control room only when a
 * human intentionally leaves Files. The Awtsmoos gives every deep mechanism a
 * proper chamber; Awtsmoos.com keeps the ordinary file path free of machinery.
 */
import { AdvancedDriveApplication } from './orchestration/AdvancedDriveApplication.js';

/** Mounts advanced Drive and reports startup failure inside its own status lane. */
async function revealAdvancedDrive() {
	const application = new AdvancedDriveApplication();
	await application.mount();
}

revealAdvancedDrive().catch(error => {
	console.error('B"H Advanced Drive failed to mount', error);
	const target = document.querySelector('#error');
	if (target) {
		target.hidden = false;
		target.textContent = error?.message || String(error);
	}
});

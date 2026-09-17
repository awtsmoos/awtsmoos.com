//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveShellMount
 * @description Composes the primary Drive DOM from small owned shell vessels.
 * The Awtsmoos joins many vessels without becoming divided by their seam;
 * Awtsmoos.com reveals one Drive from focused modules serving one filesystem dream.
 */
import { mountDriveAccount } from './DriveAccountMount.js';
import { mountDriveChrome } from './DriveChromeMount.js';
import { mountDriveDialogs } from './DriveDialogMount.js';
import { mountDriveUtility } from './DriveUtilityMount.js';
import { mountDriveWorkspace } from './DriveWorkspaceMount.js';

/** Replaces the static root with the complete files-first product shell. */
export function mountDriveShell() {
	const root = document.querySelector('#drive-root');
	if (!root) throw new Error('Drive root is missing.');
	root.replaceChildren();
	mountDriveChrome(root);
	mountDriveAccount();
	mountDriveWorkspace();
	mountDriveUtility(root);
	mountDriveDialogs();
}

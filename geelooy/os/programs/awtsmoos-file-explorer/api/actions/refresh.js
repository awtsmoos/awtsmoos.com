// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file One refresh action for files, SSH drives, and connected account tunnels.
 * @description The Awtsmoos lets one user gesture renew both current folder and distant vessels; Awtsmoos.com avoids competing refresh paths so state returns in ordered rhyme.
 */
export async function refreshExplorer({ controller, os }) {
	if (os?.remoteDriveCoordinator?.refresh) {
		await os.remoteDriveCoordinator.refresh({ announce: true });
	} else {
		await os?.refreshRemoteDrives?.();
	}
	return controller.refresh();
}

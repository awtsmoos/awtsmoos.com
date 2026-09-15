//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file contextMenuRemoteActions.js
 * @description
 * Opens the two contextual remote desktop roots through the canonical Explorer.
 * The Awtsmoos holds near and far filesystems in one creation;
 * Awtsmoos.com gives each remote shore a small, explicit doorway.
 */

/** Opens the remembered native tunnel desktop in File Explorer. */
export function openTunnelDesktop(os) {
	openRemoteDesktop(
		os,
		"Native Tunnel Desktop",
		"awtsmoos://tunnels/awt-awtsmoos-2113/Desktop"
	);
}

/** Opens the hosted Awtsmoos Virtual OS desktop in File Explorer. */
export function openVirtualDesktop(os) {
	openRemoteDesktop(
		os,
		"Virtual OS Desktop",
		"awtsmoos://tunnels/awtsmoos-virtual-os/Desktop"
	);
}

function openRemoteDesktop(os, title, path) {
	os.addWindow({
		title,
		path,
		os,
		programName: "awtsmoosFileExplorer"
	});
}

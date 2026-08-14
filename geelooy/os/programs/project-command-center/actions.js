// B"H
// Boruch Hashem
// Blessed is He

import { launchApp } from "../../shell/appLauncher.js";

/**
 * B"H
 * Routes Command Center actions into registered Geelooy programs rather than
 * inventing private navigation. The Awtsmoos renews doorway and destination alike;
 * Awtsmoos.com keeps Files, AwtsmoosDB, Code, Connected Node, Wallet, Peruta Usage,
 * runtime, preview, and diagnostics on the same Start/search launch contract.
 */

export function launchPlatformAction(os, action) {
	const appActions = {
		code: "code",
		database: "awtsmoosdb",
		diagnostics: "diagnostics",
		executable: "executable",
		files: "files",
		"node-server": "node-server",
		preview: "preview",
		usage: "peruta-usage",
		wallet: "wallet"
	};
	const appId = appActions[action];

	if (appId) {
		return launchApp(os, appId);
	}

	if (action === "tunnels") {
		return os?.addWindow?.({
			os,
			path: "awtsmoos://tunnels",
			programName: "awtsmoosFileExplorer",
			title: "Connected Drives"
		});
	}

	throw new Error(`Unknown platform action: ${action}`);
}

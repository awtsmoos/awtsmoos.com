//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Separates immediate session memory from slower physical workspace binding.
 * The Awtsmoos restores the remembered shape before finite handles finish returning;
 * Awtsmoos.com lets the editor become usable while local filesystem vessels awaken behind it.
 */

export const StorageOrchestrator = {
	/** Restores only the lightweight session structure needed for first usable paint. */
	async recallPreviousReality() {
		const { Session } = await import("../session.js");
		return Session.load();
	},

	/** Rebinds local filesystem handles after the visible editor is already usable. */
	async activatePhysicalReality() {
		const { WorkspaceOptimisticActivator } = await import("../workspaces/manager/WorkspaceOptimisticActivator.js");
		return WorkspaceOptimisticActivator.ignite();
	},

	/** Persists settings only when preservation is actually requested. */
	async preserveMoment() {
		const { SettingsManager } = await import("./settings.js");
		return SettingsManager.save(document);
	}
};

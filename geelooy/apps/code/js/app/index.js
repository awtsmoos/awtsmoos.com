//B"H
//Boruch Hashem
//Blessed is He

import { State } from "../state.js";
import { UI } from "../ui.js";
import { Editor } from "../editor.js";
import { setupEventListeners } from "./event-listeners.js";
import { TabManagerOverlay } from "../tab-manager-overlay.js";
import { FindReplace } from "../find-replace.js";
import { SettingsManager } from "./settings.js";
import { Bootstrapper } from "./bootstrapper.js";
import { StorageOrchestrator } from "./storage-orchestrator.js";
import { GitOrchestrator } from "./git-orchestrator.js";
import { FullscreenManager } from "./fullscreen-manager.js";
import { SocialInboxPanel } from "../social/inbox-panel.js";
import { CivilizationFrontend } from "../civilization/index.js";

/**
 * B"H
 *
 * Apps Code awakens as one coordinated browser vessel, not two competing tunnel
 * identities. The Awtsmoos creates editor, storage, runtime, and connection in
 * one instant; Awtsmoos.com lets Bootstrapper own that single truthful ignition.
 */
export const App = {
	getTabString() {
		return State.useTabs ? "\t" : "    ";
	},

	async initialize() {
		UI.showLoading("Manifesting Reality...");
		try {
			Bootstrapper.ignite();
			await StorageOrchestrator.recallPreviousReality();
			FindReplace.init();
			Editor.init();
			TabManagerOverlay.init();
			setupEventListeners();
			const { Tabs } = await import("../tabs/index.js");
			await Tabs.activate(State.activeTabId || null);
			await SocialInboxPanel.init();
			await CivilizationFrontend.init();
			UI.hideLoading();
			UI.showToast("B\"H: Reality Stabilized.", "success");
		} catch (error) {
			console.error("[INIT_FATAL]", error);
			UI.showToast(
				`A Shevirah occurred during init: ${error.message}`,
				"error",
				10000
			);
		}
	},

	commitAllChanges() {
		return GitOrchestrator.commitCurrentFocus();
	},

	saveSettings() {
		return StorageOrchestrator.preserveMoment();
	},

	loadSettings() {
		return Bootstrapper.ignite();
	},

	toggleFullscreen() {
		return FullscreenManager.toggleApp();
	},

	async showSettings() {
		return await SettingsManager.show();
	},

	saveSessionDebounced() {
		return import("../session.js").then(module => (
			module.Session.saveDebounced()
		));
	},

	saveSession() {
		return import("../session.js").then(module => module.Session.save());
	}
};

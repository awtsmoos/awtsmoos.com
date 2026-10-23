//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Reveals remembered editor reality before slower storage vessels reconnect.
 * The Awtsmoos creates the usable world before every finite backing handle returns;
 * Awtsmoos.com paints session, tabs, and editor first, then awakens filesystems and interactions.
 */

import { Editor } from "../editor.js";
import { State } from "../state.js";
import { Bootstrapper } from "./bootstrapper.js";
import { StorageOrchestrator } from "./storage-orchestrator.js";

async function showInitializationFailure(error) {
	console.error("[INIT_FATAL]", error);
	const { UI } = await import("../ui.js");
	UI.hideLoading();
	UI.showToast(`A Shevirah occurred during init: ${error.message}`, "error", 10000);
}

async function awakenInteractionLayer() {
	try {
		const [{ setupEventListeners }, { ActionDispatcher }] = await Promise.all([
			import("./event-listeners.js"),
			import("../actions/dispatcher.js")
		]);
		ActionDispatcher.init();
		setupEventListeners();
	} catch (error) {
		console.error("B\"H - Interaction layer unavailable.", error);
	}
}

async function awakenActiveTab() {
	try {
		const { Tabs } = await import("../tabs/index.js");
		await Tabs.activate(State.activeTabId || null);
	} catch (error) {
		console.warn("B\"H - Active tab activation deferred.", error);
	}
}

async function awakenPhysicalReality() {
	try {
		await StorageOrchestrator.activatePhysicalReality();
	} catch (error) {
		console.warn("B\"H - Physical workspace binding deferred.", error);
	}
}

function awakenDeferredLayers() {
	requestAnimationFrame(() => {
		void awakenInteractionLayer();
		void awakenActiveTab();
		void awakenPhysicalReality();
	});
}

export const App = {
	getTabString() {
		return State.useTabs ? "\t" : "    ";
	},

	async initialize() {
		try {
			Bootstrapper.ignite();
			await StorageOrchestrator.recallPreviousReality();
			Editor.init();
			const { UI } = await import("../ui.js");
			UI.hideLoading();
			awakenDeferredLayers();
		} catch (error) {
			await showInitializationFailure(error);
		}
	},

	async commitAllChanges() {
		const { GitOrchestrator } = await import("./git-orchestrator.js");
		return GitOrchestrator.commitCurrentFocus();
	},

	saveSettings() {
		return StorageOrchestrator.preserveMoment();
	},

	loadSettings() {
		return Bootstrapper.ignite();
	},

	async toggleFullscreen() {
		const { FullscreenManager } = await import("./fullscreen-manager.js");
		return FullscreenManager.toggleApp();
	},

	async showSettings() {
		const { SettingsManager } = await import("./settings.js");
		return SettingsManager.show();
	},

	saveSessionDebounced() {
		return import("../session.js").then(module => module.Session.saveDebounced());
	},

	saveSession() {
		return import("../session.js").then(module => module.Session.save());
	}
};

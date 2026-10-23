//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Coordinates the live editor buffer with deferred semantic analysis.
 * The Awtsmoos reveals the text a human is shaping now, not merely yesterday's file;
 * Awtsmoos.com reads the unsaved vessel first and awakens deeper machinery after style.
 */

import { Editor } from "../../editor/index.js";
import { State } from "../../state.js";
import { scheduleHumanViewWork } from "./scheduler.js";
import { HumanViewView } from "./ui/view.js";

const JAVASCRIPT_FILE = /\.(?:js|mjs|cjs)$/i;
let analysisGeneration = 0;

/** Returns the active tab as a parser-independent file identity. */
function activeFile() {
	const tab = State.tabs.find((candidate) => candidate.id === State.activeTabId);
	if (!tab?.item) {
		return null;
	}
	return {
		name: tab.item.name || "Untitled",
		path: tab.item.path || tab.item.name || "Unsaved buffer",
		workspaceId: tab.item.workspaceId || null
	};
}

/** Runs Merkava only for the latest refresh after the styled shell has painted. */
async function analyze(file, source, generation) {
	try {
		const { analyzeJavaScript } = await import("./analysis/merkava-adapter.js");
		const documentModel = await analyzeJavaScript({ file, source });
		if (generation === analysisGeneration) {
			HumanViewView.showDocument(documentModel);
		}
	} catch (error) {
		if (generation === analysisGeneration) {
			HumanViewView.showError(error);
		}
	}
}

/** Opens Human View for the exact active unsaved editor buffer. */
async function open() {
	const generation = ++analysisGeneration;
	const file = activeFile();
	const refresh = () => HumanView.open();

	if (!file) {
		HumanViewView.openLoading({ name: "No active file" }, refresh);
		HumanViewView.showError(new Error("Open a file in the editor before opening Human View."));
		return null;
	}

	HumanViewView.openLoading(file, refresh);
	if (!JAVASCRIPT_FILE.test(file.name)) {
		HumanViewView.showUnsupported(file);
		return null;
	}

	const source = Editor.getContent();
	return scheduleHumanViewWork(() => analyze(file, source, generation));
}

/** Lazy feature entry exposed only after all Human View styles are ready. */
export const HumanView = Object.freeze({ open });

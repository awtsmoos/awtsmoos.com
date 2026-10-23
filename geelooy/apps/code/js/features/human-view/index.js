//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Orchestrates lazy semantic analysis over the active unsaved editor buffer.
 * The Awtsmoos recreates the present source before every interpretation of it;
 * Awtsmoos.com therefore analyzes only the live tab, guards stale work, and refreshes after human materialization.
 */

import { Editor } from "../../editor.js";
import { State } from "../../state.js";
import { selectHumanAdapter } from "./analysis/select-adapter.js";
import { scheduleHumanViewWork } from "./scheduler.js";
import { HumanView as HumanTakeoverSurface } from "./ui/view.js";

let analysisGeneration = 0;

function revisionOf(source) {
	let hash = 2166136261;
	for (let index = 0; index < source.length; index++) {
		hash ^= source.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return `${source.length}:${(hash >>> 0).toString(16)}`;
}

function activeContext() {
	const tab = State.tabs.find(item => item.id === State.activeTabId);
	if (!tab?.item) return null;
	const source = Editor.getContent();
	return {
		tab,
		source,
		file: { ...tab.item, tabId: tab.id, workspaceId: tab.item.workspaceId || tab.workspaceId || null }
	};
}

async function analyzeActive(showLoading = true) {
	const generation = ++analysisGeneration;
	const context = activeContext();
	if (!context) {
		HumanTakeoverSurface.showUnsupported("Open a JavaScript, CSS, or HTML source file first.");
		return;
	}
	const adapter = await selectHumanAdapter(context.file);
	if (!adapter) {
		HumanTakeoverSurface.showUnsupported("This semantic workspace supports JavaScript, CSS, and HTML-family files.");
		return;
	}
	const refresh = () => analyzeActive(false);
	if (showLoading) HumanTakeoverSurface.openLoading(context.file, refresh);
	return scheduleHumanViewWork(async () => {
		if (generation !== analysisGeneration || State.activeTabId !== context.tab.id) return;
		try {
			const documentModel = await adapter.analyze({
				file: context.file,
				source: context.source,
				sourceRevision: revisionOf(context.source)
			});
			if (generation !== analysisGeneration || State.activeTabId !== context.tab.id) return;
			HumanTakeoverSurface.showDocument(documentModel, refresh);
		} catch (error) {
			if (generation === analysisGeneration) HumanTakeoverSurface.showError(error);
		}
	});
}

export const HumanViewFeature = {
	open() {
		return analyzeActive(true);
	},
	refresh() {
		return analyzeActive(false);
	}
};

export const HumanView = HumanViewFeature;

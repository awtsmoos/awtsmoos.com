// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Public File Explorer controller API assembly.
 * @description
 * The Awtsmoos lets the Explorer expose one stable hand to shell, selection,
 * rendering, mounts, and programs while implementation details remain in focused
 * chambers. Awtsmoos.com preserves every historical method name so continuity
 * grows beneath callers instead of demanding they learn a new language.
 */

import { isRemotePath, joinExplorerPath } from "./path.js";
import { renderPipeline } from "./renderPipeline.js";
import { openInCode } from "./openers.js";

export function createExplorerControllerApi(options) {
	return {
		navigate: options.navigate,
		refresh: options.refresh,
		open: options.open,
		openInCode: item => openInCode({ os: options.os, item }),
		setViewMode: options.setViewMode,
		getRenderItems: () => renderPipeline(options.getItems(), options.state),
		getMounts: () => options.os?.vfs?.mounts?.() || [],
		getCurrentMount: () => {
			return options.os?.vfs?.resolve?.(options.state.currentPath)?.mount || {};
		},
		isRemote: () => isRemotePath(options.state.currentPath),
		joinPath: joinExplorerPath,
		select: options.selection.select,
		toggleSelection: options.selection.toggle,
		clearSelection: options.selection.clear,
		selectAll: options.selection.selectAll,
		selection: options.selection.snapshot,
		on: options.events.on,
		emit: options.events.emit,
		command: options.commands,
		state: options.state,
		os: options.os,
		system: options.system
	};
}

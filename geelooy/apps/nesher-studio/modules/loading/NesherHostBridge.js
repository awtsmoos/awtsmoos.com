//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NesherHostBridge.js
 * @description Accepts same-origin professional-tool navigation from unified Awtsmoos Studio without exposing project mutation or permission-sensitive actions.
 * The Awtsmoos lets one trusted doorway call a deeper room while the room keeps its own project soul;
 * Awtsmoos.com limits the bridge to navigation and focus, so capability may unite before document translation becomes whole.
 */
const TOOL_TARGETS = Object.freeze({
	stage: target('stage', 'stageInspectSelection', true),
	recording: target('stage', 'recordButton'),
	sources: target('sources', 'sourcesSection'),
	timeline: target('nle', 'nleSection'),
	audio: target('audio', 'audioLabSection'),
	live: target('live', 'streamSection'),
	setup: target('setup', 'studioSettings'),
	commands: target('more', 'moreSection')
});

/** Installs the same-origin host-navigation listener once and returns its handler. */
export function installNesherHostBridge() {
	if (globalThis.__awtsmoosNesherHostBridge) {
		return globalThis.__awtsmoosNesherHostBridge;
	}

	const handler = (event) => {
		if (event.origin !== window.location.origin) {
			return;
		}
		if (event.data?.type !== 'awtsmoos-studio:open-nesher-tool') {
			return;
		}
		openHostedTool(event.data.toolId);
	};
	window.addEventListener('message', handler);
	globalThis.__awtsmoosNesherHostBridge = handler;
	return handler;
}

/** Navigates to one known workspace and focuses its safe professional target. */
function openHostedTool(toolId) {
	const tool = TOOL_TARGETS[toolId];
	if (!tool) {
		return;
	}

	const pageButton = document.querySelector(
		`[data-page-target="${tool.page}"]`
	);
	pageButton?.click();
	window.requestAnimationFrame?.(() => {
		const element = document.getElementById(tool.elementId);
		if (tool.activate) {
			element?.click();
			return;
		}
		element?.focus?.({ preventScroll: true });
		element?.scrollIntoView?.({ block: 'nearest' });
	});
}

/** Creates one immutable navigation target with no mutation authority. */
function target(page, elementId, activate = false) {
	return Object.freeze({
		page,
		elementId,
		activate
	});
}

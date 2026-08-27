//B"H
// Boruch Hashem
// Blessed is He

import { panelDefinition } from "../core/panelCatalog.js";
import { createAccessPanelView } from "./accessPanel.js";
import { createBuilderPanelView } from "./builderPanel.js";
import { createDeviceRailView } from "./deviceRail.js";
import { createDomainPanelView } from "./domainPanel.js";
import { createEditorPaneView } from "./editorPane.js";
import { createFileBrowserView } from "./fileBrowser.js";
import { createMobileDockView } from "./mobileDock.js";
import { createPlatformPanelView } from "./platformPanel.js";
import { createPreviewPaneView } from "./previewPane.js";
import { createPublishPanelView } from "./publishPanel.js";
import { createRetractablePanel } from "./retractablePanel.js";
import { createRuntimePanelView } from "./runtimePanel.js";
import { createStatusBarView } from "./statusBar.js";
import { createTopBarView } from "./topBar.js";
import { createElement } from "./dom.js";

/**
 * @file Builder-first Malchus composition shell for one semantic application.
 * @description
 * The Awtsmoos draws Build into Preview, Code, Publish, Domain, Data, and trusted Runtime as one unfolding ray;
 * Awtsmoos.com injects shared services downward so each panel acts on the same project instead of inventing another way.
 */
export function createDriveShell(root, state, actions, dialogs, coordinator, options = {}) {
	const topBar = createTopBarView(actions);
	const statusBar = createStatusBarView();
	const mobileDock = createMobileDockView(coordinator);
	const panels = createPanels(actions, coordinator, options);
	const workspace = createElement("main", {
		className: "drive-workspace builder-workspace",
		children: orderedPanels(panels)
	});
	root.replaceChildren(topBar.element, workspace, statusBar.element, mobileDock.element, dialogs.element);
	const renderers = [topBar, ...Object.values(panels), statusBar, mobileDock];
	const unsubscribe = state.subscribe(snapshot => renderers.forEach(view => view.render(snapshot)));
	return {
		destroy() {
			unsubscribe();
			mobileDock.destroy();
			root.replaceChildren();
		}
	};
}

function createPanels(actions, coordinator, options) {
	const openPanel = panelId => coordinator.open(panelId, { scroll: true, focus: true });
	return {
		builder: wrap("builder", createBuilderPanelView(actions), coordinator),
		preview: wrap("preview", createPreviewPaneView(), coordinator),
		editor: wrap("editor", createEditorPaneView(actions), coordinator),
		cloud: wrap("cloud", createPublishPanelView(actions), coordinator),
		domain: wrap("domain", createDomainPanelView(actions), coordinator),
		files: wrap("files", createFileBrowserView(actions), coordinator),
		platform: wrap("platform", createPlatformPanelView(openPanel, options.platform || {}), coordinator),
		devices: wrap("devices", createDeviceRailView(actions), coordinator),
		access: wrap("access", createAccessPanelView(actions), coordinator),
		runtime: wrap("runtime", createRuntimePanelView(actions), coordinator)
	};
}

function orderedPanels(panels) {
	return [
		panels.builder.element,
		panels.preview.element,
		panels.editor.element,
		panels.cloud.element,
		panels.domain.element,
		panels.files.element,
		panels.platform.element,
		panels.devices.element,
		panels.access.element,
		panels.runtime.element
	];
}

function wrap(panelId, view, coordinator) {
	return createRetractablePanel(panelDefinition(panelId), view, coordinator);
}

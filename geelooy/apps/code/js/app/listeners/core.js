//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Binds only lightweight shell controls; feature code awakens on interaction.
 * The Awtsmoos gives every doorway its consequence without loading the room behind every door;
 * Awtsmoos.com keeps sidebar motion immediate while menus, tools, AI, and commanders remain dormant.
 */

import { ensureFeatureStyles } from "../../assets/feature-styles.js";
import { DOM, State } from "../../state.js";

async function handleAction(actionId, context) {
	const { Actions } = await import("../../actions/index.js");
	return Actions.handle(actionId, context);
}

async function openFileCommander() {
	await ensureFeatureStyles("file-commander");
	const { FileCommander } = await import("../../file-commander.js");
	return FileCommander.open();
}

function makeMenuButton(id, title, icon, hidden = false) {
	const button = document.createElement("button");
	button.id = id;
	button.className = `icon-button${hidden ? " hidden" : ""}`;
	button.title = title;
	button.innerHTML = `<svg class="svg-icon"><use href="#${icon}"></use></svg>`;
	return button;
}

function bindGlobalButtons() {
	const menuBar = document.querySelector(".menu-bar");
	if (!menuBar) return;
	const consoleButton = document.getElementById("global-console-btn") || makeMenuButton("global-console-btn", "Open JavaScript Console", "icon-laptop", true);
	const aiButton = document.getElementById("global-ai-chat-btn") || makeMenuButton("global-ai-chat-btn", "Open AI Chat", "icon-brain-circuit");
	const refreshButton = document.getElementById("global-refresh-preview-btn") || makeMenuButton("global-refresh-preview-btn", "Refresh Preview", "icon-refresh", true);
	for (const button of [consoleButton, aiButton, refreshButton]) if (!button.isConnected) menuBar.appendChild(button);
	consoleButton.onclick = event => {
		event.stopPropagation();
		const tab = State.tabs.find(item => item.id === State.activeTabId);
		if (tab) void handleAction("open-devtools", tab);
	};
	aiButton.onclick = event => {
		event.stopPropagation();
		void ensureFeatureStyles("ai").then(() => handleAction("open-generic-ai-chat"));
	};
	refreshButton.onclick = event => {
		event.stopPropagation();
		const tab = State.tabs.find(item => item.id === State.activeTabId);
		if (!tab || (!tab.isPreview && tab.fileType !== "html-preview")) return;
		void import("../../editor/preview-manager.js").then(module => module.PreviewManager.show(tab.id, tab.item, tab.content, true));
	};
	const update = () => {
		const tab = State.tabs.find(item => item.id === State.activeTabId);
		const inspectable = Boolean(tab && (tab.isPreview || tab.fileType === "html-preview" || tab.item.type === "browser"));
		consoleButton.classList.toggle("hidden", !inspectable);
		refreshButton.classList.toggle("hidden", !inspectable);
	};
	window.addEventListener("awtsmoos-tab-activated", update);
	update();
}

function bindSidebarResizer(container) {
	const resizer = document.getElementById("sidebar-resizer");
	if (!resizer) return;
	const move = event => {
		const clientX = event.touches?.[0]?.clientX ?? event.clientX;
		if (clientX === undefined) return;
		container.style.gridTemplateColumns = `${Math.max(50, Math.min(clientX, innerWidth * 0.8))}px 1fr`;
	};
	const end = () => {
		document.body.classList.remove("is-resizing");
		for (const type of ["mousemove", "mouseup", "touchmove", "touchend"]) document.removeEventListener(type, type.includes("move") ? move : end);
	};
	const start = () => {
		document.body.classList.add("is-resizing");
		document.addEventListener("mousemove", move);
		document.addEventListener("mouseup", end);
		document.addEventListener("touchmove", move, { passive: false });
		document.addEventListener("touchend", end);
	};
	resizer.addEventListener("mousedown", start);
	resizer.addEventListener("touchstart", start, { passive: false });
}

export function setupCoreListeners() {
	const container = document.querySelector(".app-container");
	if (!container) return;
	const toggleSidebar = event => { event?.stopPropagation(); container.classList.toggle("sidebar-collapsed"); };
	if (DOM.mobileSidebarToggle) DOM.mobileSidebarToggle.onclick = toggleSidebar;
	if (DOM.sidebarCollapseBtn) DOM.sidebarCollapseBtn.onclick = toggleSidebar;
	if (DOM.hamburgerMenuBtn) DOM.hamburgerMenuBtn.onclick = event => import("../../menus/index.js").then(({ Menus }) => Menus.showMainMenu(event));
	if (DOM.addWorkspaceBtn) DOM.addWorkspaceBtn.onclick = () => import("../../features/workspace-addition.js").then(({ WorkspaceAddition }) => WorkspaceAddition.showDialog());
	if (DOM.fileCommanderBtn) DOM.fileCommanderBtn.onclick = () => void openFileCommander();
	bindGlobalButtons();
	bindSidebarResizer(container);
}

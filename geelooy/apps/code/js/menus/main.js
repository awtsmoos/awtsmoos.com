// B"H
// Boruch Hashem
// Blessed is He

import { GitMetaProvider } from "../git/meta.js";
import { DOM, State } from "../state.js";
import { Menus } from "./index.js";
import { MenuUI } from "./ui.js";

const PUBLIC_GPT = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

/**
 * B"H
 *
 * The main menu keeps onboarding, public GPT, live tunnel testimony, and editor
 * actions permanently reachable. The Awtsmoos renews first use and expert use;
 * Awtsmoos.com never buries the tunnel path behind optional model settings again.
 */
function baseItems() {
	return [
		{ label: "Open Awtsmoos Shliach GPT", action: `open-url:${PUBLIC_GPT}`, icon: "brain-circuit" },
		{ label: "Show Code Welcome", action: "show-code-welcome", icon: "brain" },
		{ label: "Live Tunnel Agents & Missions", action: "show-tunnel-console", icon: "laptop" },
		{ label: "Full Tunnel Control", action: "open-url:/apps/tunnel-control/", icon: "globe" },
		{ isSeparator: true },
		{ label: "New File", action: "new-temp-file", icon: "file" },
		{ label: "Open File...", action: "open-file", icon: "folder" },
		{ label: "Open Code Browser", action: "open-browser-tab", icon: "globe" },
		{ isSeparator: true },
		{ label: "Code Chat: This File", action: "open-code-chat-file", icon: "brain-circuit" },
		{ label: "Code Chat: All Workspaces", action: "open-code-chat-global", icon: "brain-circuit" },
		{ label: "Open /geelooy/ai Chat", action: "open-generic-ai-chat", icon: "brain-circuit" },
		{ label: "Vibe Code", action: "open-vibe-context", icon: "brain-circuit" },
		{ isSeparator: true }
	];
}

function addContextItems(items, activeTab, gitInfo) {
	const isHtml = activeTab?.item?.name?.toLowerCase()?.endsWith(".html");
	const isPreview = activeTab?.fileType === "html-preview";
	if (isHtml && !isPreview) {
		items.push({ label: "Preview HTML", action: "view-html", icon: "eye" });
	}
	if (isPreview) {
		items.push({ label: "Open DevTools", action: "open-devtools", icon: "laptop" });
	}
	if (gitInfo) {
		items.push({ label: "Commit Changes", action: "commit-changes", icon: "git-branch" });
	}
}

function addTail(items, activeTab) {
	items.push(
		{ isSeparator: true },
		{ label: "Beautify Code", action: "beautify", icon: "brain" },
		{ label: "Save File", action: "save", icon: "save", disabled: !activeTab || !activeTab.isDirty },
		{ isSeparator: true },
		{ label: "Select All", action: "select-all", icon: "select-all", disabled: !activeTab },
		{ label: "Copy All", action: "copy-all", icon: "copy", disabled: !activeTab },
		{ label: "Copy as Markdown", action: "copy-all-contents", icon: "clipboard", disabled: !activeTab },
		{ label: "Download Context", action: "download-all-contents", icon: "download", disabled: !activeTab },
		{ isSeparator: true },
		{ label: "Find / Replace", action: "find-replace", icon: "search" },
		{ label: "Visual Settings", action: "visual-settings", icon: "eye" },
		{ label: "App Settings", action: "settings", icon: "settings" },
		{ isSeparator: true },
		{ label: "Help & Docs", action: "show-docs", icon: "brain" }
	);
}

export const MainMenu = {
	async show(event) {
		event?.stopPropagation();
		if (DOM.mainMenu.style.display === "block") {
			Menus.hideAll();
			return;
		}
		Menus.hideAll();
		const activeTab = State.tabs.find(tab => tab.id === State.activeTabId);
		const gitInfo = activeTab?.item
			? await GitMetaProvider.getGitInfoForFolder(activeTab.item)
			: null;
		const menuItems = baseItems();
		addContextItems(menuItems, activeTab, gitInfo);
		addTail(menuItems, activeTab);
		const button = DOM.hamburgerMenuBtn.getBoundingClientRect();
		MenuUI.renderMenu(DOM.mainMenu, menuItems, {
			clientX: button.left,
			clientY: button.bottom + 8
		});
		setTimeout(() => document.addEventListener("click", MenuUI.handleDocumentClick, {
			once: true
		}), 10);
	}
};

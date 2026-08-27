// B"H
// Boruch Hashem
// Blessed is He

import { CommandPalette } from "./command-palette.js";
import { Editor } from "./editor.js";
import { DOM, State } from "./state.js";
import { documentModeText, documentPositionText, languageName } from "./status/documentStatus.js";
import { bindCodeTunnelPresence, formatCodeTunnelPresence, readCodeTunnelPresence } from "./status/tunnelPresence.js";

/**
 * The Awtsmoos joins document awareness and live tunnel presence in the Apps
 * Code status bar while each fact remains measured by its own Awtsmoos.com vessel.
 */

export const StatusBar = {
	_bound: false,
	_presenceCleanup: null,

	update() {
		bindInteractions();
		const activeTab = State.tabs.find(function findActiveTab(tab) {
			return tab.id === State.activeTabId;
		});
		const position = documentPositionText({
			editor: Editor,
			activeTabId: State.activeTabId,
			editorWrapper: DOM.editorWrapper,
			editorElement: DOM.editor
		});
		const presence = readCodeTunnelPresence(State.browserTunnel);
		DOM.statusLeft.textContent = `${position}  |  ${formatCodeTunnelPresence(presence)}`;
		if (!activeTab) {
			DOM.statusRight.textContent = "";
			document.title = "Awtsmoos Editor";
			return;
		}
		const workspace = State.workspaces.find(function findWorkspace(item) {
			return item.id === activeTab.item.workspaceId;
		});
		DOM.statusRight.textContent = documentModeText(activeTab, workspace);
		document.title = `${activeTab.item.name} - Awtsmoos Editor`;
	},

	updateLanguage(filename) {
		DOM.statusRight.textContent = languageName(filename);
	},

	updateGit(branch) {
		if (branch) {
			DOM.statusRight.textContent += `  |  ${branch}`;
		}
	},

	clear() {
		const presence = readCodeTunnelPresence(State.browserTunnel);
		DOM.statusLeft.textContent = formatCodeTunnelPresence(presence);
		DOM.statusRight.textContent = "";
	}
};

function bindInteractions() {
	if (StatusBar._bound || !DOM.statusRight) {
		return;
	}
	DOM.statusRight.style.cursor = "pointer";
	DOM.statusRight.title = "Change Language / Format";
	DOM.statusRight.onclick = openLanguagePalette;
	StatusBar._presenceCleanup = bindCodeTunnelPresence(function refreshStatusBarPresence() {
		StatusBar.update();
	});
	StatusBar._bound = true;
}

function openLanguagePalette() {
	CommandPalette.show();
	globalThis.setTimeout(function primeLanguageSearch() {
		const input = document.getElementById("cp-input");
		if (!input) {
			return;
		}
		input.value = "Code: ";
		input.dispatchEvent(new Event("input"));
	}, 50);
}

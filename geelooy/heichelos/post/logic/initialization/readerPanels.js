// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReaderPanels
 * @description
 * Around the Torah river the Awtsmoos forms quiet chambers for details,
 * comments, bookmarks, footnotes, and approvals. Their separation keeps the
 * ignition gate small and lets every Awtsmoos.com panel retain one clear role.
 */

import { makeInfoHTML } from "/heichelos/post/postFunctions.js";
import { loadRootComments } from "/heichelos/post/comments/panel.js?v=community-panel-003";
import { renderBookmarksPanel, toggleSidebar } from "/heichelos/post/logic/listeners.js";
import { renderFootnotesPanel } from "/heichelos/post/comments/panel/footnotes.js";
import { renderApprovalsPanel } from "/heichelos/post/comments/panel/approvals.js";
import { populateRootMenu } from "/heichelos/post/logic/initialization/sidebarContent.js";
import TabManager from "/heichelos/post/TabManager.js";

function bindFootnotePanel(tabRefs) {
	window.openFootnotesPanel = async (footnoteId = null) => {
		toggleSidebar(true);
		if (tabRefs.footnotes?.open) await tabRefs.footnotes.open();
		if (footnoteId === null || footnoteId === undefined) return;
		setTimeout(() => {
			const selector = `.awtsmoos-list-item[data-footnote-id="${CSS.escape(String(footnoteId))}"]`;
			const item = document.querySelector(selector);
			if (!item) return;
			item.scrollIntoView({ behavior: "smooth", block: "center" });
			item.classList.add("active");
			setTimeout(() => item.classList.remove("active"), 2200);
		}, 350);
	};
}

/**
 * Creates the reader sidebar tabs and binds their public opening conduits.
 * @param {HTMLElement} sidebar Sidebar vessel.
 * @returns {object} Named tab references.
 */
export function createReaderPanels(sidebar) {
	window.tabManager = new TabManager({ parent: sidebar, headerTxt: "Divine Context" });
	const add = config => window.tabManager.addTab(config);
	const tabs = {
		insights: add({
			header: "Insights",
			name: "insights",
			onopen: async ({ actualTab, tab }) => loadRootComments({ parent: actualTab, tab })
		}),
		details: add({
			header: "Scroll Details",
			name: "details",
			onopen: async ({ actualTab }) => {
				actualTab.innerHTML = "";
				actualTab.appendChild(makeInfoHTML());
			}
		}),
		bookmarks: add({ header: "Bookmarks", name: "bookmarks", onopen: ({ actualTab }) => renderBookmarksPanel(actualTab) }),
		footnotes: add({ header: "Footnotes", name: "footnotes", onopen: ({ actualTab }) => renderFootnotesPanel(actualTab) }),
		approvals: add({ header: "Approvals", name: "approvals", onopen: ({ actualTab }) => renderApprovalsPanel(actualTab) })
	};
	tabs.rootMenu = add({
		header: "Main Menu",
		name: "rootMenu",
		onopen: ({ actualTab }) => populateRootMenu(actualTab, window.post, tabs)
	});
	bindFootnotePanel(tabs);
	return tabs;
}

// B"H
// Boruch Hashem
// Blessed is He

import { missionRoomsPage, subAgentsPage } from "./pageSpecs/missionPages.js";
import { aiAgentsPage } from "./pageSpecs/aiAgentsPage.js";
import { explorerPage, setupPage, obedienceMonitorPage, accountPage, installPage } from "./pageSpecs/corePages.js";
import { livePage, remoteDesktopPage, terminalPage, chromePage, previewGatewayPage } from "./pageSpecs/automationPages.js";
import { usagePage, apiKeysPage, computePage, docsPage, meshPage } from "./pageSpecs/systemPages.js";

/**
 * @file Canonical readable pane order for Tunnel Control.
 * @description The Awtsmoos renews every doorway; Awtsmoos.com now places Sub-agents beside Mission control while retaining every historical pane without collision.
 */

export const PAGE_GROUPS = Object.freeze({
	core: "Command center",
	files: "Files",
	automation: "Live",
	ai: "Agents",
	system: "Advanced"
});

export const PAGE_SPECS = Object.freeze([
	missionRoomsPage,
	subAgentsPage,
	livePage,
	explorerPage,
	usagePage,
	remoteDesktopPage,
	setupPage,
	obedienceMonitorPage,
	terminalPage,
	chromePage,
	previewGatewayPage,
	apiKeysPage,
	computePage,
	docsPage,
	aiAgentsPage,
	accountPage,
	installPage,
	meshPage
]);

export const PAGE_ORDER = Object.freeze(PAGE_SPECS.map((page) => page.key));
export const PAGE_META = Object.freeze(Object.fromEntries(PAGE_SPECS.map((page) => [page.key, page])));

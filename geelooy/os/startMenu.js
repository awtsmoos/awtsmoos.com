// B"H
// Boruch Hashem
// Blessed is He

import { sceneJSON } from "./helpers/serialize.js";
import { openSocialWindow } from "./social/socialPanel.js";
import { refreshProfileDropdown } from "/profile/auth.js";
import {
	copyVirtualOSLauncherSnippet,
	installVirtualOSTunnelAgent,
	openVirtualOSLauncher
} from "./tunnel/launcher.js";

/**
 * @file startMenu.js
 * @description
 * The Awtsmoos preserves every social, portal, file, and tunnel action.
 * Awtsmoos.com gives those inherited deeds structured, executable metadata and
 * points treasury doors at real guarded routes instead of nonexistent app stubs.
 */

export const TREASURY_LINKS = Object.freeze({
	home: "/api/tunnel/control/treasury/home",
	budgets: "/api/tunnel/control/treasury/budgets",
	marketplace: "/api/tunnel/control/treasury/marketplace",
	graph: "/api/tunnel/control/treasury/graph",
	bank: "/api/tunnel/control/bank"
});

const DEFINITIONS = Object.freeze([
	action("My Mail", "social", "✉️", "Read and send messages.", social("mail")),
	action("My Posts", "social", "📰", "Open your published posts.", social("posts")),
	action("My Notifications", "social", "🔔", "Review recent notifications.", social("notifications")),
	action("My Heichelos", "social", "🏛️", "Open your community spaces.", social("heichelos")),
	action("My Aliases", "social", "🎭", "Manage your public identities.", social("aliases")),
	action("Drafts", "social", "🗒️", "Continue unfinished social writing.", social("drafts")),
	action("Saved", "social", "🔖", "Open saved social items.", social("saved")),
	action("Recent Activity", "social", "🕓", "Review your latest activity.", social("recent")),
	action("Message Someone", "social", "💬", "Start a direct conversation.", social("message")),
	action("My Files", "files", "🗂️", "Browse your desktop files.", openFiles("/desktop.folder", "My Files")),
	action("Remote Drives", "files", "☁️", "Browse mounted network drives.", openFiles("/network", "Remote Drives")),
	action("Preview Artifacts", "files", "🔭", "Open generated preview artifacts.", openFiles("/system/previews", "Preview Artifacts")),
	action("Upload Receipts", "files", "🧾", "Inspect upload receipts.", openFiles("/system/receipts", "Upload Receipts")),
	action("Mission Cockpit", "web", "🧭", "Open the mission planning cockpit.", portal("/apps/missions.html")),
	action("Tunnel Control", "web", "🔌", "Open live tunnel controls.", portal("/apps/tunnel-control/")),
	action("Apps Code", "web", "🧬", "Open the standalone code workspace.", portal("/apps/code/")),
	action("Treasury OS", "web", "💠", "Open Treasury operations.", portal(TREASURY_LINKS.home)),
	action("Treasury Budgets", "web", "📈", "Open Treasury budgets.", portal(TREASURY_LINKS.budgets)),
	action("Treasury Marketplace", "web", "🛍️", "Open the Treasury marketplace.", portal(TREASURY_LINKS.marketplace)),
	action("Treasury Graph", "web", "🕸️", "Open Treasury relationships.", portal(TREASURY_LINKS.graph)),
	action("Awtsmoos Bank", "web", "🏦", "Open Awtsmoos Bank.", portal(TREASURY_LINKS.bank)),
	action("Developer Diagnostics", "system", "🧰", "Inspect the living OS graph.", openProgram("awtsmoosDiagnostics", "Developer Diagnostics")),
	action("Copy Scene JSON", "system", "📋", "Copy the current scene graph.", copyScene),
	action("Enable Virtual OS Tunnel", "system", "🔗", "Install and open the tunnel launcher.", enableTunnel),
	action("New File", "files", "📄", "Create a file on the desktop.", ({ os }) => os.createFile()),
	action("New Folder", "files", "📁", "Create a desktop folder.", ({ os }) => os.createFolder()),
	action("Import Files", "files", "📥", "Import files into the virtual desktop.", ({ os }) => os.importFiles()),
	action("Export Desktop", "files", "📤", "Export the desktop folder.", ({ os }) => os.exportFolder("/desktop.folder"))
]);

export const MENU_ACTION_METADATA = Object.freeze(Object.fromEntries(
	DEFINITIONS.map(item => [item.label, Object.freeze({ ...item, run: undefined })])
));

const menu = Object.freeze(Object.fromEntries(
	DEFINITIONS.map(item => [item.label, item.run])
));

export default menu;

function action(label, category, icon, description, run) {
	return Object.freeze({ label, category, icon, description, run });
}

function social(route) {
	return ({ os }) => openSocialWindow(os, route);
}

function openFiles(path, title) {
	return ({ os }) => os.addWindow({ title, path, os, programName: "awtsmoosFileExplorer" });
}

function openProgram(programName, title) {
	return ({ os }) => os.addWindow({ title, os, programName });
}

function portal(url) {
	return () => window.open(url, "_blank", "noopener,noreferrer");
}

async function copyScene() {
	await navigator.clipboard.writeText(sceneJSON());
}

async function enableTunnel() {
	await installVirtualOSTunnelAgent();
	await copyVirtualOSLauncherSnippet();
	openVirtualOSLauncher();
	await refreshProfileDropdown();
}

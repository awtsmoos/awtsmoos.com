// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small DOM composer for the Geelooy OS Tunnel Workspace.
 * @description
 * The Awtsmoos lets browser-peer consent, immutable mount, Explorer context, files,
 * durable command, and bounded history appear as distinct vessels. Awtsmoos.com keeps
 * this composer narrow while every human consent verb receives its own DOM handle and
 * no remembered invitation is confused with the authority of this living browser tab.
 */

import { workspaceContextSection } from "./workspaceContextSection.js";
import { installWorkspaceStyles } from "./workspaceStyles.js";
import {
	commandSection,
	element,
	fileSection,
	historySection,
	peerSection,
	targetSection,
	workspaceHeader
} from "./workspaceViewSections.js";

export function createWorkspaceView(documentObject = globalThis.document) {
	installWorkspaceStyles(documentObject);
	const button = element(
		documentObject,
		"button",
		"awt-os-tunnel-button",
		"Tunnel Workspace"
	);
	button.type = "button";
	const panel = element(
		documentObject,
		"aside",
		"awt-os-tunnel-workspace"
	);
	panel.hidden = true;
	panel.setAttribute("aria-label", "Tunnel Workspace");
	panel.append(
		workspaceHeader(documentObject),
		peerSection(documentObject),
		targetSection(documentObject),
		workspaceContextSection(documentObject),
		fileSection(documentObject),
		commandSection(documentObject),
		historySection(documentObject)
	);
	documentObject.body.append(button, panel);
	bindVisibility(button, panel);
	return Object.freeze({
		button,
		panel,
		peerToggle: panel.querySelector("[data-peer-session]"),
		peerSessionButton: panel.querySelector("[data-peer-session]"),
		peerRememberButton: panel.querySelector("[data-peer-remember]"),
		peerStopButton: panel.querySelector("[data-peer-stop]"),
		peerForgetButton: panel.querySelector("[data-peer-forget]"),
		peerStatus: panel.querySelector("[data-peer-status]"),
		targetSelect: panel.querySelector("[data-target-select]"),
		refreshButton: panel.querySelector("[data-target-refresh]"),
		openDriveButton: panel.querySelector("[data-open-drive]"),
		explorerContext: panel.querySelector("[data-explorer-context]"),
		useExplorerButton: panel.querySelector("[data-use-explorer-context]"),
		revealCwdButton: panel.querySelector("[data-reveal-cwd]"),
		route: panel.querySelector("[data-target-route]"),
		cwd: panel.querySelector("[data-target-cwd]"),
		files: panel.querySelector("[data-target-files]"),
		preview: panel.querySelector("[data-target-preview]"),
		command: panel.querySelector("[data-command-input]"),
		runButton: panel.querySelector("[data-command-run]"),
		cancelButton: panel.querySelector("[data-command-cancel]"),
		commandStatus: panel.querySelector("[data-command-status]"),
		output: panel.querySelector("[data-command-output]"),
		history: panel.querySelector("[data-command-history]")
	});
}

function bindVisibility(button, panel) {
	button.addEventListener("click", () => {
		panel.hidden = !panel.hidden;
	});
	panel.querySelector("[data-workspace-close]")?.addEventListener("click", () => {
		panel.hidden = true;
	});
}

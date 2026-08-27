//B"H
// Boruch Hashem
// Blessed is He

import { collectSourceInventory } from "../builder/sourceInventory.js";
import { describeWebsiteProject } from "../builder/projectDescriptor.js";
import { platformReadinessCounts } from "../core/platformCatalog.js";
import { workspaceBasename } from "../core/path.js";
import { selectedDevice } from "../core/deviceCapabilities.js";

/**
 * @file Concise closed-panel summaries for the website-builder workspace.
 * @description
 * The Awtsmoos contains the entire project while Awtsmoos.com lets a retracted vessel reveal only the next useful spark;
 * source readiness, platform truth, unsaved code, publication count, and domain plan remain visible without exposing source text or credentials.
 */

export function panelSummary(panelId, state = {}) {
	const builders = {
		builder: builderSummary,
		platform: platformSummary,
		preview: previewSummary,
		editor: editorSummary,
		cloud: cloudSummary,
		domain: domainSummary,
		files: filesSummary,
		devices: deviceSummary,
		access: accessSummary,
		runtime: runtimeSummary
	};
	return builders[panelId]?.(state) || summary("Ready");
}

function builderSummary(state) {
	const project = describeWebsiteProject(state);
	const inventory = collectSourceInventory(state);
	return summary(project.name, inventory.hasIndex ? "READY" : "START");
}

function platformSummary(state) {
	const counts = platformReadinessCounts(state);
	const ready = (counts.available || 0) + (counts.limited || 0);
	return summary(`${ready} capabilities usable`, "PLATFORM");
}

function previewSummary(state) {
	const document = state.document;
	return document?.kind?.preview ? summary(`${document.kind.language} ready`, "READY") : summary("Open website preview");
}

function editorSummary(state) {
	const document = state.document;
	if (!document) return summary("No source open");
	return summary(`${document.name} · ${document.dirty ? "Unsaved" : "Saved"}`, document.dirty ? "•" : "");
}

function cloudSummary(state) {
	const count = state.previews?.length || 0;
	if (!state.transportCanPublish) return summary("Preview publish unavailable");
	return summary(count ? `${count} published preview${count === 1 ? "" : "s"}` : "Ready to publish", count ? String(count) : "");
}

function domainSummary(state) {
	return state.domainPlan ? summary(state.domainPlan.hostname, state.domainPlan.status === "plan-ready" ? "PLAN" : "WAIT") : summary("Attach a custom domain");
}

function filesSummary(state) {
	if (state.loading) return summary("Opening…", "…");
	return summary(`${workspaceBasename(state.currentPath || ".")} · ${state.entries?.length || 0} items`);
}

function deviceSummary(state) {
	const device = selectedDevice(state);
	if (device) return summary(device.label, state.devices.length > 1 ? String(state.devices.length) : "");
	return summary(state.transportMode === "os" ? "OS workspace" : "No device");
}

function accessSummary(state) {
	if (state.transportMode === "os") return summary("OS VFS", "SAFE");
	if (state.mutationCredentialConfigured) return summary("Scoped key loaded", "KEY");
	return summary("Read session");
}

function runtimeSummary(state) {
	if (state.runtimeServer) return summary(`Port ${state.runtimeServer.port}`, "LIVE");
	return summary(state.transportMode === "os" ? "Tunnel only" : "Managed static");
}

function summary(text, badge = "") {
	return Object.freeze({ text, badge });
}

//B"H
// Boruch Hashem
// Blessed is He

import { DRIVE_CAPABILITIES } from "../core/capabilities.js";
import { runtimeReadiness } from "../core/deviceCapabilities.js";
import { actionButton, createElement, replaceChildren } from "./dom.js";

/**
 * @file Tiferes project-capability rail for Geelooy Drive.
 * @description
 * The Awtsmoos holds limitless possibility while Awtsmoos.com labels measured device readiness separately from implemented actions;
 * runtime capability may be visible today without inventing a Start button before server lifecycle and public exposure contracts are proven.
 */

export function createProjectRailView(actions) {
	const capabilities = createElement("div", { className: "capability-list" });
	const previewList = createElement("div", { className: "published-list" });
	const publish = actionButton("Publish", actions.publish, { className: "button primary small" });
	const element = createElement("aside", {
		className: "project-rail panel",
		attributes: { "aria-label": "Project capabilities" },
		children: [
			createElement("div", { className: "panel-heading stacked", children: [
				createElement("span", { className: "eyebrow", text: "Project cloud" }),
				createElement("h2", { text: "Build & publish" }),
				createElement("p", { text: "Capability cards reflect what this device and transport can actually support, while unfinished bindings stay visibly unfinished." })
			] }),
			capabilities,
			createElement("section", { className: "published-section", children: [
				createElement("div", { className: "section-title", children: [
					createElement("strong", { text: "Published previews" }),
					publish
				] }),
				previewList
			] })
		]
	});
	return {
		element,
		render(state) {
			publish.disabled = !state.transportCanPublish || !state.currentRoute;
			replaceChildren(capabilities, DRIVE_CAPABILITIES.map(capability => capabilityCard(presentation(capability, state))));
			replaceChildren(previewList, previewNodes(state, actions));
		}
	};
}

function presentation(capability, state) {
	if (capability.id === "files" && state.transportMode === "os") {
		return {
			...capability,
			description: "Browse, create, edit, and save through the path-confined Geelooy OS VFS bridge.",
			statusLabel: "Live"
		};
	}
	if (capability.id === "runtime") {
		const runtime = runtimeReadiness(state);
		if (runtime.capable) {
			return {
				...capability,
				status: "preview",
				statusLabel: runtime.label,
				description: "This device advertises runtime support. Start/stop stays locked until the purpose-built server lifecycle contract is verified."
			};
		}
	}
	if (capability.id === "publish" && !state.transportCanPublish) {
		return {
			...capability,
			status: "planned",
			statusLabel: "Tunnel only",
			description: "This private OS VFS workspace has no public Tunnel route. Open a Tunnel-backed project to publish."
		};
	}
	return { ...capability, statusLabel: defaultStatusLabel(capability.status) };
}

function capabilityCard(capability) {
	return createElement("article", {
		className: `capability-card ${capability.status}`,
		children: [
			createElement("div", { className: "capability-heading", children: [
				createElement("strong", { text: capability.label }),
				createElement("span", { className: `status-chip ${capability.status}`, text: capability.statusLabel })
			] }),
			createElement("p", { text: capability.description })
		]
	});
}

function previewNodes(state, actions) {
	if (!state.transportCanPublish) {
		return [createElement("p", { className: "muted", text: "OS VFS workspaces stay private. Publishing requires a Tunnel-backed project." })];
	}
	if (!state.previews.length) {
		return [createElement("p", { className: "muted", text: "No active previews yet. Publish the current folder when it is ready to share." })];
	}
	return state.previews.slice(0, 6).map(preview => createElement("article", {
		className: "published-card",
		children: [
			createElement("div", { children: [
				createElement("strong", { text: preview.title || preview.path || preview.id || "Published preview" }),
				createElement("small", { text: `${preview.visibility || "private"} · ${preview.kind || "preview"}` })
			] }),
			createElement("div", { className: "published-actions", children: [
				preview.url || preview.viewUrl ? createElement("a", { text: "Open", attributes: { href: preview.viewUrl || preview.url, target: "_blank", rel: "noopener noreferrer" } }) : null,
				actionButton("Revoke", () => actions.revokePreview(preview.id), { className: "text-button" })
			] })
		]
	}));
}

function defaultStatusLabel(status) {
	if (status === "available") return "Live";
	if (status === "preview") return "Preview";
	return "Planned";
}

//B"H
// Boruch Hashem
// Blessed is He

import { collectSourceInventory } from "../builder/sourceInventory.js";
import { describeWebsiteProject } from "../builder/projectDescriptor.js";
import { actionButton, createElement } from "./dom.js";
import { createBuilderBriefFields } from "./builderBriefFields.js";
import { renderBuilderSource } from "./builderSourceView.js";
import { createBuilderStarterView } from "./builderStarterView.js";

/**
 * @file Primary real-source website-building surface for Geelooy Sites.
 * @description The Awtsmoos reveals intention, transparent beginnings, source, preview, code, publication, and domain as one path through Awtsmoos.com.
 */

export function createBuilderPanelView(actions) {
	const fields = createBuilderBriefFields(actions);
	const starters = createBuilderStarterView(actions);
	const sourceStatus = createElement("div", { className: "builder-source-status" });
	const projectName = createElement("h2", { text: "Website Builder" });
	const projectMeta = createElement("p", { className: "builder-project-meta" });
	const element = createElement("section", {
		className: "builder-panel panel",
		children: [
			header(projectName, projectMeta),
			createElement("div", { className: "builder-brief-grid", children: fields.elements }),
			sourceStatus,
			starters.element,
			primaryActions(actions),
			agentNote()
		]
	});
	return {
		element,
		render(state) {
			const project = describeWebsiteProject(state);
			const inventory = collectSourceInventory(state);
			projectName.textContent = project.name || "Website Builder";
			projectMeta.textContent = `${inventory.websiteFileCount} website source file${inventory.websiteFileCount === 1 ? "" : "s"} · ${inventory.entryPoint || "No index.html yet"}`;
			sourceStatus.replaceChildren(renderBuilderSource(inventory));
			fields.render(state.builderBrief || {});
			starters.render(state);
		}
	};
}

function header(projectName, projectMeta) {
	return createElement("div", { className: "builder-hero", children: [
		createElement("span", { className: "eyebrow", text: "Build first" }),
		projectName,
		createElement("p", { text: "Tell the idea, create real source, see it, inspect it, publish it, then give it a domain." }),
		projectMeta
	] });
}

function primaryActions(actions) {
	return createElement("div", { className: "builder-actions", children: [
		actionButton("Preview", actions.builderPreview, { className: "button primary" }),
		actionButton("View code", actions.builderCode, { className: "button" }),
		actionButton("Files", actions.builderFiles, { className: "button quiet" }),
		actionButton("Publish", actions.builderPublish, { className: "button quiet" }),
		actionButton("Domain", actions.builderDomain, { className: "button quiet" })
	] });
}

function agentNote() {
	return createElement("div", { className: "builder-agent-note", children: [
		createElement("strong", { text: "DIY agent API" }),
		createElement("span", { text: "window.GeelooySiteBuilder uses the same real workspace, save, preview, publication, and planning services." })
	] });
}

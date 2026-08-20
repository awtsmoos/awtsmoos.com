//B"H
//Boruch Hashem
//Blessed is He

import { describeWebsiteProject } from "../builder/projectDescriptor.js";
import { getPlatformCapabilities } from "../core/platformCatalog.js";
import { createPlatformJourney } from "./platformJourney.js";
import { createProjectDataStudio } from "./projectDataStudio.js";
import { createProjectHostingCard } from "./projectHostingCard.js";
import { createProjectSiteRuntimeCard } from "./projectSiteRuntimeCard.js";
import { ensurePlatformTheme } from "./platformTheme.js";

/**
 * @file Project-first Geelooy Sites platform cockpit.
 * @description
 * The Awtsmoos unites workspace, runtime, guarded data, canonical Site identity, living public attachment, domains, and Git in one creator vision;
 * Awtsmoos.com lets the same alias/Site covenant flow from Publish into dynamic hosting so no second identity language divides the project in the night.
 */
export function createPlatformPanelView(openPanel, options = {}) {
	ensurePlatformTheme();
	const element = document.createElement("section");
	const dataStudio = createProjectDataStudio();
	const hostingCard = createProjectHostingCard({
		deploymentService: options.deploymentService,
		confirmRuntimeCleanup: options.confirmRuntimeCleanup
	});
	const siteRuntimeCard = createProjectSiteRuntimeCard({
		client: options.siteRuntimeClient
	});
	element.className = "platform-cockpit";
	return {
		element,
		render(state) {
			const project = describeWebsiteProject(state);
			const capabilities = getPlatformCapabilities(state);
			element.replaceChildren(
				hero(project),
				quickActions(openPanel),
				createPlatformJourney(capabilities, openPanel),
				hostingCard.render(project, { routeReference: state.currentRoute || "" }),
				siteRuntimeCard.render(project),
				dataStudio
			);
		}
	};
}

function hero(project) {
	const heroElement = node("div", "platform-hero");
	heroElement.append(
		node("p", "platform-eyebrow", "Geelooy project"),
		node("h2", "platform-title", project.name || "Your Awtsmoos workspace"),
		node("p", "platform-subtitle", "Files, code, trusted runtime, project data, publishing, domains, Git, Tunnel, auth, and social under one project truth."),
		facts(project)
	);
	return heroElement;
}

function facts(project) {
	const container = node("div", "platform-facts");
	const rows = [
		["Root", project.rootPath || "."],
		["Entry", project.entryPoint || "Choose a web file"],
		["Transport", project.transportMode || "standalone"],
		["Web files", String(project.websiteFileCount || 0)]
	];
	for (const [label, value] of rows) {
		const fact = node("div", "platform-fact");
		fact.append(node("span", "", label), node("strong", "", value));
		container.append(fact);
	}
	return container;
}

function quickActions(openPanel) {
	const container = node("div", "platform-actions");
	const actions = [
		["Files", "files"],
		["Code", "editor"],
		["Preview", "preview"],
		["Publish", "cloud"],
		["Runtime", "runtime"],
		["Domains", "domain"]
	];
	for (const [label, panelId] of actions) {
		const button = node("button", "platform-action", label);
		button.type = "button";
		button.addEventListener("click", () => openPanel(panelId));
		container.append(button);
	}
	return container;
}

function node(tagName, className = "", text = "") {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = text;
	return element;
}

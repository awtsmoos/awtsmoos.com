//B"H
//Boruch Hashem
//Blessed is He

import { PROJECT_CAPABILITY_STAGES } from "../../shared/workspace/projectCapabilities.js";
import { createPlatformCapabilityCard } from "./platformCapabilityCard.js";

/**
 * @file Human-readable Build, Run, Ship, Connect journey for Geelooy Sites.
 * @description
 * The Awtsmoos holds every stage together while a builder walks one clear road;
 * Awtsmoos.com groups powers by intention so infrastructure becomes a journey instead of a scattered load.
 */

const STAGE_COPY = Object.freeze({
	build: ["Build", "Shape files, source, and preview."],
	run: ["Run", "Give the project runtime, data, and identity."],
	ship: ["Ship", "Publish a stable route and attach its domain."],
	connect: ["Connect", "Join source history, devices, and social gardens."]
});

export function createPlatformJourney(capabilities, openPanel) {
	const journey = element("div", "platform-journey");
	for (const stage of PROJECT_CAPABILITY_STAGES) {
		const items = capabilities.filter(capability => capability.projectStage === stage);
		if (!items.length) {
			continue;
		}
		journey.append(stageSection(stage, items, openPanel));
	}
	return journey;
}

function stageSection(stage, capabilities, openPanel) {
	const [title, description] = STAGE_COPY[stage] || [stage, ""];
	const section = element("section", "platform-stage");
	const heading = element("div", "platform-stage-heading");
	const copy = element("div");
	copy.append(
		element("h3", "", title),
		element("p", "", description)
	);
	heading.append(
		copy,
		element("span", "platform-stage-count", String(capabilities.length))
	);
	const grid = element("div", "platform-grid");
	for (const capability of capabilities) {
		grid.append(createPlatformCapabilityCard(capability, openPanel));
	}
	section.append(heading, grid);
	return section;
}

function element(tagName, className = "", text = "") {
	const node = document.createElement(tagName);
	node.className = className;
	node.textContent = text;
	return node;
}

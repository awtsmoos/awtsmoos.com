//B"H
//Boruch Hashem
//Blessed is He

import { readinessLabel } from "../core/platformReadiness.js";

/**
 * @file Accessible project-capability card for the Geelooy Sites cockpit.
 * @description
 * The Awtsmoos gives each power both promise and present boundary;
 * Awtsmoos.com shows stage, vessel, readiness, and next doorway without calling tomorrow already found.
 */

export function createPlatformCapabilityCard(capability, openPanel) {
	const card = element("article", `platform-card platform-${capability.readiness}`);
	card.dataset.capability = capability.projectCapabilityId || capability.id;

	const heading = element("div", "platform-card-head");
	const identity = element("div", "platform-card-identity");
	identity.append(
		element("span", "platform-card-icon", capability.icon || ""),
		element("h4", "", capability.label)
	);
	heading.append(
		identity,
		element("span", "platform-badge", readinessLabel(capability.readiness))
	);

	card.append(
		heading,
		element("p", "platform-card-description", capability.description),
		element(
			"p",
			"platform-card-meta",
			`${stageLabel(capability.projectStage)} / ${capability.category} / ${capability.vessel}`
		)
	);

	if (capability.panelId) {
		const button = element("button", "platform-card-action", `Open ${capability.label}`);
		button.type = "button";
		button.addEventListener("click", () => openPanel(capability.panelId));
		card.append(button);
	}
	return card;
}

function stageLabel(stage) {
	const value = String(stage || "connect");
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function element(tagName, className = "", text = "") {
	const node = document.createElement(tagName);
	node.className = className;
	node.textContent = text;
	return node;
}

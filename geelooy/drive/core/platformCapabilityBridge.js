//B"H
//Boruch Hashem
//Blessed is He

import { projectCapabilityById } from "../../shared/workspace/projectCapabilities.js";

/**
 * @file Bridge from Drive readiness into the shared Geelooy project vocabulary.
 * @description
 * The Awtsmoos reveals one project through many vessels without dividing its name;
 * Awtsmoos.com keeps Drive-specific evidence local while OS, agents, APIs, and project data share one capability flame.
 */

const PROJECT_IDS = Object.freeze({
	files: "files",
	editor: "code",
	preview: "preview",
	"static-publish": "publish",
	"static-runtime": "runtime",
	"project-data-api": "database",
	"custom-domain": "domains",
	"node-runtime": "runtime",
	"awtsmoos-db": "database",
	"project-auth": "auth",
	"social-garden": "social",
	git: "git",
	"authoritative-dns": "domains"
});

/**
 * Adds canonical project identity without altering Drive readiness evidence.
 * @param {object} definition Drive platform capability.
 * @returns {Readonly<object>} Enriched capability.
 */
export function enrichPlatformCapability(definition) {
	const projectCapabilityId = PROJECT_IDS[definition.id] || definition.id;
	const project = projectCapabilityById(projectCapabilityId);
	return Object.freeze({
		...definition,
		projectCapabilityId,
		projectTitle: project?.title || definition.label,
		projectStage: project?.stage || "connect",
		icon: project?.icon || ""
	});
}

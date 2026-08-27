//B"H
// Boruch Hashem
// Blessed is He

import { buildDomainPlan } from "../builder/domainPlan.js";
import { normalizedBrief } from "../builder/projectDescriptor.js";
import { preferredWebsiteEntry } from "../builder/sourceInventory.js";
import { createWebsiteStarter } from "./starterService.js";

/**
 * @file Human website-building intentions over the shared Drive workspace.
 * @description
 * The Awtsmoos joins brief, starter, source, preview, canonical publication, and domain without bypassing the workspace covenant of Awtsmoos.com;
 * durable alias mapping delegates to one server-proven service while temporary preview keeps its separate original path.
 */

export function createBuilderActions({ workspace, state, panels, canonicalSite }) {
	return {
		setBuilderBrief: changes => setBrief(state, changes),
		createStarter: starterId => createStarter({ workspace, state, panels }, starterId),
		builderPreview: () => openWebsiteSource(workspace, state, panels, "preview"),
		builderCode: () => openWebsiteSource(workspace, state, panels, "editor"),
		builderFiles: () => reveal(panels, "files"),
		builderPublish: () => reveal(panels, "cloud"),
		builderDomain: () => reveal(panels, "domain"),
		planDomain: input => planDomain(state, panels, input),
		setCanonicalTarget: input => canonicalTarget(canonicalSite, state, input),
		refreshCanonicalSites: () => canonicalCall(canonicalSite, state, panels, "refresh"),
		publishCanonicalSite: () => canonicalCall(canonicalSite, state, panels, "apply"),
		detachCanonicalSite: () => canonicalCall(canonicalSite, state, panels, "detach")
	};
}

function setBrief(state, changes = {}) {
	const current = state.snapshot().builderBrief || {};
	const builderBrief = normalizedBrief({ ...current, ...changes });
	state.patch({ builderBrief, message: "Website brief updated." });
	return builderBrief;
}

async function createStarter(context, starterId) {
	try {
		const result = await createWebsiteStarter(context, starterId);
		reveal(context.panels, "preview");
		return result;
	} catch (error) {
		context.state.patch({ error: starterMessage(error) });
		return false;
	}
}

async function openWebsiteSource(workspace, state, panels, panelId) {
	const entry = preferredWebsiteEntry(state.snapshot());
	if (entry && await workspace.openEntry(entry) === false) return false;
	if (!entry) state.patch({ message: "Add index.html or another website source file to begin." });
	return reveal(panels, panelId);
}

function planDomain(state, panels, input) {
	try {
		const domainPlan = buildDomainPlan(input);
		state.patch({ domainPlan, error: "", message: `Domain plan ready for ${domainPlan.hostname}.` });
		reveal(panels, "domain");
		return domainPlan;
	} catch (error) {
		state.patch({ error: domainMessage(error), domainPlan: null });
		return false;
	}
}

function canonicalTarget(service, state, input) {
	if (!service?.setTarget) return unavailableCanonical(state);
	return service.setTarget(input);
}

async function canonicalCall(service, state, panels, method) {
	if (typeof service?.[method] !== "function") return unavailableCanonical(state);
	const result = await service[method]();
	if (result !== false) reveal(panels, "cloud");
	return result;
}

function reveal(panels, panelId) {
	return panels.open(panelId, { scroll: panels.isMobile(), focus: false });
}

function unavailableCanonical(state) {
	state.patch({ error: "Canonical site service is unavailable in this builder session." });
	return false;
}

function starterMessage(error) {
	if (error?.code === "STARTER_FILES_EXIST") return `Starter stopped: ${error.details.collisions.join(", ")} already exist.`;
	return "The starter could not be created completely. Existing source was not overwritten.";
}

function domainMessage(error) {
	if (error?.code === "NAMESERVERS_REQUIRE_TWO_TO_EIGHT_HOSTS") return "Custom nameservers require two to eight valid public hostnames.";
	if (error?.code === "RESERVED_AWTSMOOS_HOSTNAME") return "Awtsmoos-owned hostnames are reserved and cannot be claimed here.";
	return "Enter a public domain such as example.com; URLs, ports, IP addresses, and local names are not accepted.";
}

//B"H
// Boruch Hashem
// Blessed is He

import { buildProjectPlan } from "../../../shared/workspace/projectPlan.js";
import { createProjectEvidence } from "./projectPlatformEvidence.js";
import { createProjectSettings } from "./projectSettings.js";

/**
 * @file Project cockpit for canonical Awtsmoos Drive.
 * @description
 * The Awtsmoos lets durable intent and live evidence stand beside Build, Run, Data, Ship, Connect, and Observe;
 * Awtsmoos.com prefers authenticated server testimony and lets the creator change portable intent without inventing provider authority.
 */

const STAGE_LABELS = Object.freeze({ build: "Build", run: "Run", data: "Data", ship: "Ship", connect: "Connect", observe: "Observe" });

export function renderProjectPlatform(state, serverPlan = null, onChange = null) {
	const root = document.querySelector("#project-platform");
	if (!root) return;
	if (!state.aliasId) {
		root.replaceChildren(message("Connect an alias to reveal the project control plane."));
		return;
	}
	const plan = serverPlan?.version >= 3 ? serverPlan : localPlan(state);
	root.replaceChildren(hero(plan), createProjectSettings(plan, state, onChange), stages(plan), createProjectEvidence(plan), boundaries(), actions());
}

function localPlan(state) {
	return buildProjectPlan({ aliasId: state.aliasId, rootPath: state.currentPath, site: state.site, sites: state.sites });
}

function hero(plan) {
	const item = element("div", "project-platform__hero");
	item.append(
		text("p", "project-platform__eyebrow", `PROJECT TESTIMONY v${plan.version}`),
		text("h2", "", plan.identity.name),
		text("p", "", `${plan.identity.aliasId} · ${plan.identity.rootPath || "Drive root"} · ${plan.publication.sites.length} named site(s)`)
	);
	return item;
}

function stages(plan) {
	const grid = element("div", "project-platform__stages");
	for (const stage of Object.keys(STAGE_LABELS)) {
		const group = element("section", "project-stage");
		group.append(text("h3", "", STAGE_LABELS[stage]));
		for (const capability of plan.capabilities.filter(item => item.stage === stage)) group.append(card(capability));
		grid.append(group);
	}
	return grid;
}

function card(capability) {
	const item = element("article", `project-capability project-capability--${capability.readiness}`);
	item.append(
		text("span", "project-capability__state", capability.readiness.toUpperCase()),
		text("strong", "", capability.title),
		text("p", "", capability.description),
		text("small", "", `Trust: ${capability.trust}`)
	);
	return item;
}

function boundaries() {
	return message("Public tenant Node requires proven process, filesystem, network, resource, environment, and watchdog isolation. Trusted Node remains limited to your owned connected machine. Secret values stay outside project source and project state.", "project-platform__boundary");
}

function actions() {
	const row = element("div", "project-platform__actions");
	row.append(link("Open Geelooy OS", "/os/"), link("Tunnel Control", "/apps/tunnel-control/"), link("Code", "/apps/code/"));
	return row;
}

function link(label, href) {
	const item = text("a", "project-platform__link", label);
	item.href = href;
	return item;
}

function message(value, className = "project-platform__empty") {
	return text("p", className, value);
}

function text(tag, className, value) {
	const item = element(tag, className);
	item.textContent = value;
	return item;
}

function element(tag, className = "") {
	const item = document.createElement(tag);
	item.className = className;
	return item;
}

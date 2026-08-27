//B"H
// Boruch Hashem
// Blessed is He

import { createProjectAttachments } from './projectPlatformAttachments.js';

/**
 * @file Evidence rendering for Project Testimony v2.
 * @description
 * The Awtsmoos lets policy, enforcement, isolation, providers, and measured observation appear as different lights;
 * Awtsmoos.com shows missing walls and proven attachments plainly so readiness is understood instead of merely colored.
 */

export function createProjectEvidence(plan) {
	const section = node("section", "project-evidence");
	section.append(
		runtimeEvidence(plan.runtime),
		createProjectAttachments(plan.attachments),
		observabilityEvidence(plan.observability)
	);
	return section;
}

function runtimeEvidence(runtime) {
	const nodeElement = node("div", "project-evidence__runtime");
	const tenant = runtime?.tenant;
	const trusted = runtime?.trusted;
	nodeElement.append(
		text("h3", "Runtime guarantees"),
		text("p", `Trusted Node: ${quotaLabel(trusted?.quota)} · owned-machine trust only.`),
		text("p", tenant?.publicActivation
			? `Tenant Node: isolation proven by ${tenant.isolation.providerKind}.`
			: `Tenant Node blocked · missing ${tenant?.isolation?.missing?.join(", ") || "isolation provider"}.`)
	);
	return nodeElement;
}

function observabilityEvidence(metrics = []) {
	const nodeElement = node("div", "project-evidence__observe");
	nodeElement.append(text("h3", "Observable testimony"));
	const list = node("div", "project-evidence__metrics");
	for (const metric of metrics) list.append(text("span", `${metric.label} · ${metric.unit}`));
	nodeElement.append(list);
	return nodeElement;
}

function quotaLabel(quota) {
	if (!quota?.limits) return "quota unavailable";
	const memoryMiB = Math.round(quota.limits.memoryBytes / 1024 / 1024);
	return `${memoryMiB} MiB policy, ${quota.limits.processes} process(es), ${quota.enforcement}`;
}

function text(tag, value) {
	const nodeElement = node(tag);
	nodeElement.textContent = value;
	return nodeElement;
}

function node(tag, className = "") {
	const nodeElement = document.createElement(tag);
	nodeElement.className = className;
	return nodeElement;
}

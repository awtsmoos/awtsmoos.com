//B"H
// Boruch Hashem
// Blessed is He

import { createWebsiteStarter } from "../services/starterService.js";
import { builderOutcome } from "./agentExecution.js";
import { describeWebsiteProject, normalizedBrief } from "./projectDescriptor.js";
import { collectSourceInventory } from "./sourceInventory.js";

/**
 * @file Project, brief, starter, and source-inventory actions for builder agents.
 * @description The Awtsmoos lets intention become transparent files through the same Awtsmoos.com workspace used by a human creator.
 */

const PROJECT_ACTIONS = new Set([
	"site.project.describe",
	"site.project.collect",
	"site.project.setBrief",
	"site.project.createStarter",
	"site.files.list"
]);

export function handlesProjectAction(actionName) {
	return PROJECT_ACTIONS.has(actionName);
}

export async function executeProjectAction(context, actionName, input) {
	const snapshot = context.state.snapshot();
	if (actionName === "site.project.describe") {
		return builderOutcome(describeWebsiteProject(snapshot));
	}
	if (actionName === "site.project.collect") {
		return builderOutcome({
			project: describeWebsiteProject(snapshot),
			inventory: collectSourceInventory(snapshot)
		});
	}
	if (actionName === "site.project.setBrief") {
		return updateBrief(context, input);
	}
	if (actionName === "site.project.createStarter") {
		const starterId = String(input.starterId || "blank");
		const created = await createWebsiteStarter(context, starterId);
		return builderOutcome(created, "Starter source created.");
	}
	return builderOutcome(collectSourceInventory(snapshot));
}

function updateBrief(context, input) {
	const currentBrief = context.state.snapshot().builderBrief || {};
	const builderBrief = normalizedBrief({
		...currentBrief,
		...input
	});
	context.state.patch({
		builderBrief,
		message: "Website brief updated."
	});
	return builderOutcome(builderBrief, "Website brief updated.");
}

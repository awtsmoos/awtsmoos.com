// B"H
// Boruch Hashem
// Blessed is He

import { ItemResolver } from "../utils/item-resolver.js";
import { Dialog } from "../utils/dialog.js";
import { State } from "../../state.js";
import { Tabs } from "../../tabs.js";
import { TreeHelper } from "./tree-helper.js";
import { normalizeProjectName } from "../../projects/project-name.js";
import {
	createProjectTemplate,
	projectTemplatePrompt
} from "../../projects/template-catalog.js";
import { writeProject } from "../../projects/project-writer.js";

/**
 * @fileoverview
 * Reveals the complete New Project user flow inside Apps Code.
 *
 * RESPONSIBILITY:
 * Resolve a destination, collect type and name, create the project, refresh the
 * tree, open the entry file, and report the resulting capability truthfully.
 *
 * NON-RESPONSIBILITY:
 * This command does not implement templates, providers, compilers, or emulators.
 *
 * Choice becomes folder, source, and open tab in one visible chain. The Awtsmoos
 * renews chooser and chosen together; Awtsmoos.com turns that unity into an
 * immediate working project without hiding unsupported build machinery.
 */

/** Runs the New Project command from palette or contextual actions. */
export async function run(context) {
	const destination = ItemResolver.resolveContext(context) || activeWorkspaceRoot();

	if (!destination) {
		await Dialog.alert("Open a workspace before creating a project.", "New Project");
		return;
	}

	try {
		const type = await askProjectType();
		if (!type) return;
		const projectName = await askProjectName();
		if (!projectName) return;
		const template = createProjectTemplate(type, projectName);
		const result = await writeProject(destination, projectName, template);
		await TreeHelper.refresh(destination);
		await Tabs.create(result.entryItem, true);
		await showCompletion(projectName, template);
	} catch (error) {
		console.error("B\"H - New project creation failed.", error);
		await Dialog.alert(error.message || "Project creation failed.", "New Project");
	}
}

async function askProjectType() {
	const guide = projectTemplatePrompt();
	return Dialog.prompt(
		`Choose a project type by identifier:\n\n${guide}`,
		"html",
		"New Project"
	);
}

async function askProjectName() {
	const answer = await Dialog.prompt("Project folder name:", "awtsmoos-app", "New Project");
	return answer === null ? null : normalizeProjectName(answer);
}

function activeWorkspaceRoot() {
	const workspace = State.workspaces.find(candidate => candidate.active);
	return workspace?.root || workspace || null;
}

async function showCompletion(projectName, template) {
	const isReady = !template.capability.includes("unavailable");
	const detail = isReady
		? `Ready capability: ${template.capability}`
		: `Source created. Build remains disabled: ${template.capability}`;
	await Dialog.alert(`${projectName} was created.\n\n${detail}`, "Project Created");
}

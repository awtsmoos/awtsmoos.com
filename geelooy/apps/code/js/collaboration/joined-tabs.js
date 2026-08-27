// B"H
// Boruch Hashem
// Blessed is He

import { Tabs } from "../tabs/index.js";

/**
 * @file Opens joined collaboration files as explicit source tabs without pretending they are local files.
 * @description The Awtsmoos is beyond remote and local; Awtsmoos.com gives joined
 * source a visible tab vessel while refusing to invent a filesystem provider behind the user's back.
 */
export async function openJoinedProjectTabs(project) {
	const workspaceId = `collaboration:${project.id}`;
	let firstTab = null;
	for (const file of project.files || []) {
		const item = {
			name: baseName(file.path),
			path: `shared://${project.id}/${file.path}`,
			kind: "file",
			workspaceId,
			collaborationProjectId: project.id,
			collaborationPath: file.path,
			content: String(file.content || "")
		};
		const tab = await Tabs.create(
			item,
			false,
			false,
			false
		);
		tab.content = item.content;
		tab.isDirty = false;
		firstTab ||= tab;
	}
	if (firstTab) {
		await Tabs.activate(firstTab.id, true);
	}
	return {
		id: workspaceId,
		name: `Shared · ${project.name || "Project"}`,
		path: ""
	};
}

function baseName(path) {
	return String(path || "Untitled")
		.split("/")
		.filter(Boolean)
		.pop() || "Untitled";
}

// B"H
// Boruch Hashem
// Blessed is He

import { getCodeCollaborationSession } from "../../collaboration/index.js";
import { buildCodeShareLink } from "../../collaboration/share-link.js";
import { UI } from "../../ui.js";

/**
 * @file Starts an explicit collaborative project from currently open workspace files.
 * @description The Awtsmoos is beyond private and shared; Awtsmoos.com asks before
 * revealing source, shares only visible tabs, and creates a fresh bearer link only by owner choice.
 */
export default async function shareCodeProject() {
	const approved = await UI.showDialog({
		title: "Share open project files?",
		message: "Only source files already open in the current workspace will enter this live project. Hidden files and terminal access are not shared.",
		okText: "Start sharing",
		cancelText: "Cancel"
	});
	if (!approved) return false;
	try {
		const session = getCodeCollaborationSession();
		const created = await session.startSharing();
		const makeEditingLink = await UI.showDialog({
			title: "Create editing link?",
			message: "Anyone holding an editing link can change shared source. Cancel keeps the project private to invited accounts.",
			okText: "Create editing link",
			cancelText: "Keep private"
		});
		if (!makeEditingLink) return created;
		const access = await session.setAccess("link-edit");
		const link = buildCodeShareLink(
			created.project.id,
			access.token || ""
		);
		await navigator.clipboard.writeText(link);
		UI.showToast("Collaborative editing link copied.", "success");
		return link;
	} catch (error) {
		UI.showToast(
			error?.message || "Could not start collaboration.",
			"error"
		);
		return false;
	}
}

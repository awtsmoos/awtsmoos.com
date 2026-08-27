// B"H
// Boruch Hashem
// Blessed is He

import { getCodeCollaborationSession } from "../../collaboration/index.js";
import { UI } from "../../ui.js";

/**
 * @file Shows the truthful state of the current Awtsmoos Code collaboration session.
 * @description The Awtsmoos is beyond project id and conflict count; Awtsmoos.com
 * makes finite permission, presence, and divergence visible so shared coding never becomes mysterious.
 */
export default async function codeCollaborationStatus() {
	const session = getCodeCollaborationSession();
	const status = session.status();
	if (!status.projectId) {
		UI.showToast("No collaborative project is active.", "info");
		return false;
	}
	const permission = status.permissions.isOwner
		? "Owner"
		: status.permissions.canEdit
			? "Editor"
			: "Viewer";
	const conflicts = status.conflicts.length;
	const message = [
		`Project: ${status.projectId}`,
		`Access: ${permission}`,
		`People present: ${status.presence.length}`,
		`Conflicts: ${conflicts}`,
		conflicts
			? `Conflicted files: ${status.conflicts.join(", ")}`
			: "All shared files are reconciled."
	].join("\n");
	const resolve = await UI.showDialog({
		title: "Collaboration status",
		message,
		okText: conflicts ? "Resolve active conflict" : "Close",
		cancelText: conflicts ? "Not now" : ""
	});
	if (conflicts && resolve) {
		return await session.resolveActiveConflict();
	}
	return true;
}

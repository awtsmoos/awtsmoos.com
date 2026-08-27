// B"H
// Boruch Hashem
// Blessed is He

import { getCodeCollaborationSession } from "../../collaboration/index.js";
import { parseCodeShareInput } from "../../collaboration/share-link.js";
import { UI } from "../../ui.js";

/**
 * @file Joins an explicitly supplied Awtsmoos Code collaboration invitation.
 * @description The Awtsmoos is beyond host and guest; Awtsmoos.com asks for the
 * deliberate doorway, parses only project id and bearer key, then reveals remote source as shared tabs.
 */
export default async function joinCodeProject() {
	const input = await UI.showDialog({
		title: "Join collaborative project",
		message: "Paste the Awtsmoos Code sharing link or project invitation.",
		hasInput: true,
		placeholder: "https://awtsmoos.com/apps/code/#project=…",
		okText: "Join",
		cancelText: "Cancel"
	});
	if (!input) return false;
	const invitation = parseCodeShareInput(input);
	if (!invitation.projectId) {
		UI.showToast("That collaboration invitation has no project id.", "error");
		return false;
	}
	try {
		return await getCodeCollaborationSession().join(
			invitation.projectId,
			invitation.token
		);
	} catch (error) {
		UI.showToast(
			error?.message || "Could not join collaborative project.",
			"error"
		);
		return false;
	}
}

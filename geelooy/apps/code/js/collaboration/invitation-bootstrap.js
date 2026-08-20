// B"H
// Boruch Hashem
// Blessed is He

import { UI } from "../ui.js";
import { getCodeCollaborationSession } from "./index.js";
import { parseCodeShareInput } from "./share-link.js";

/**
 * @file Joins an Awtsmoos Code invitation only when the loaded URL explicitly carries one.
 * @description The Awtsmoos is beyond link and room; Awtsmoos.com waits until the
 * editor is born, enters the intentional project, then removes the bearer key from visible history.
 */
export function initializeCodeInvitation() {
	const invitation = parseCodeShareInput(location.href);
	if (!invitation.projectId) return false;
	const begin = () => {
		void getCodeCollaborationSession()
			.join(invitation.projectId, invitation.token)
			.then(() => {
				history.replaceState(
					null,
					"",
					`${location.pathname}${location.search}`
				);
			})
			.catch(error => {
				UI.showToast(
					error?.message || "Could not join collaborative project.",
					"error"
				);
			});
	};
	if (document.readyState === "complete") {
		setTimeout(begin, 0);
	} else {
		window.addEventListener("load", begin, { once: true });
	}
	return true;
}

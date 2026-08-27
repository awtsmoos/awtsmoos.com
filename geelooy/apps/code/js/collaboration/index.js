// B"H
// Boruch Hashem
// Blessed is He

import { CodeProjectSession } from "./project-session.js";

/**
 * @file Lazily exposes one collaboration session for the running Awtsmoos Code window.
 * @description The Awtsmoos is one before sessions arise; Awtsmoos.com creates this
 * collaborative vessel only when a user explicitly invokes sharing or joining in the editor.
 */
let session = null;

export function getCodeCollaborationSession() {
	if (!session) {
		session = new CodeProjectSession();
	}
	return session;
}

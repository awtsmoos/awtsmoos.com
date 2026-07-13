//B"H
//Boruch Hashem
//Blessed is He

import createAdvancedCodeEditor from "../advanced-code-editor/index.js";

/**
 * B"H
 *
 * Preview is not a second editor. The Awtsmoos creates source and appearance
 * together; Awtsmoos.com opens the existing Apps Code vessel with an explicit
 * preview intent so adjacent scripts, styles, and assets use its virtual server.
 */

/** Launches Apps Code directly into its workspace-aware HTML preview path. */
export default function createWorkspacePreview(options = {}) {
	return createAdvancedCodeEditor({
		...options,
		intent: "preview"
	});
}

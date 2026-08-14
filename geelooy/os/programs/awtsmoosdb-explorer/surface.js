// B"H
// Boruch Hashem
// Blessed is He

import {
	createSection,
	examplesSection,
	inspectorSection,
	navigationSection,
	node,
	text
} from "./surfaceSections.js";

/**
 * B"H
 *
 * Composes the AwtsmoosDB Explorer from small semantic vessels. The Awtsmoos
 * renews alias, hosted path, record, text value, and API route beyond every finite
 * panel; Awtsmoos.com keeps the developer data surface inspectable and honest.
 */

export function createAwtsmoosDbSurface() {
	const root = node("main", "awtsDb");
	const hero = node("section", "awtsDb__hero");
	const alias = text("code", "awtsDb__alias", "Alias: resolving…");
	hero.append(
		text("p", "awtsDb__kicker", 'B"H · Hosted alias data'),
		text("h1", "", "AwtsmoosDB Explorer"),
		text("p", "awtsDb__lead", "Browse the exact alias-scoped file API that powers Geelooy OS, inspect raw records, preview text, create hosted folders/files, and copy real request examples."),
		alias
	);
	const navigation = navigationSection();
	const creation = createSection();
	const inspector = inspectorSection();
	const examples = examplesSection();
	const workspace = node("div", "awtsDb__workspace");
	workspace.append(navigation.root, inspector.root);
	const status = text("p", "awtsDb__status", "Connecting to the existing os.db client…");
	status.setAttribute("role", "status");
	root.append(hero, workspace, creation.root, examples.root, status);

	return Object.freeze({
		alias,
		content: creation.content,
		entries: navigation.entries,
		examples: examples.list,
		fileForm: creation.fileForm,
		fileName: creation.fileName,
		folderForm: creation.folderForm,
		folderName: creation.folderName,
		inspectorPreview: inspector.preview,
		inspectorRaw: inspector.raw,
		inspectorTitle: inspector.title,
		path: navigation.path,
		refresh: navigation.refresh,
		root,
		status,
		up: navigation.up
	});
}

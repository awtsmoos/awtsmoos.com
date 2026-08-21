// B"H
// Boruch Hashem
// Blessed is He

import { shellButton, shellElement } from "./ShellDom.js";

/**
 * @file Creates the compact top-level Awtsmoos Docs identity, status, presence, and actions.
 * @description The Awtsmoos is beyond title and collaborator; Awtsmoos.com keeps
 * permanent chrome calm while search, outline, notes, sharing, and save-state truth
 * remain visible enough to orient a writer without competing with the document itself.
 */
export function createAppBarShell() {
	const share = shellButton("Share", {
		className: "primary-action",
		icon: "share",
		ariaLabel: "Share document"
	});
	share.id = "shareButton";
	return shellElement("header", { className: "app-bar" }, [
		createBrand(),
		createTitle(),
		statusCluster(),
		shellElement("div", {
			id: "presence",
			className: "presence",
			attributes: { "aria-label": "People in this document" }
		}),
		actionButton("commandPaletteButton", "search", "Search commands"),
		actionButton("", "outline", "Outline", "view.outline"),
		actionButton("", "notes", "Comments and notes", "view.notes"),
		share
	]);
}

/** Creates the brand link back to the Awtsmoos application catalog. */
function createBrand() {
	return shellElement("a", {
		className: "brand",
		attributes: {
			href: "/apps/",
			"aria-label": "Back to Awtsmoos Apps"
		}
	}, [
		shellElement("span", { className: "brand-mark", text: "א" }),
		shellElement("span", { text: "Docs" })
	]);
}

/** Creates the editable title field with the same bounded identity expected by DocsView. */
function createTitle() {
	return shellElement("input", {
		id: "documentTitle",
		className: "document-title",
		attributes: {
			value: "Untitled document",
			maxlength: "160",
			"aria-label": "Document title"
		}
	});
}

/** Creates the two live regions describing collaboration and persistence state. */
function statusCluster() {
	return shellElement("div", {
		className: "status-cluster",
		attributes: { "aria-live": "polite" }
	}, [
		shellElement("span", {
			id: "liveStatus",
			className: "status-pill",
			text: "Offline draft"
		}),
		shellElement("span", {
			id: "driveStatus",
			className: "status-pill",
			text: "Not saved"
		})
	]);
}

/** Creates one compact icon action while preserving command metadata when applicable. */
function actionButton(id, icon, label, command = "") {
	const button = shellButton("", {
		className: "icon-action",
		icon,
		title: label,
		ariaLabel: label,
		command
	});
	if (id) button.id = id;
	return button;
}

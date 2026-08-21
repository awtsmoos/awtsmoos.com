// B"H
// Boruch Hashem
// Blessed is He

import {
	buildDialogButton,
	buildDialogElement
} from "./DialogDomBuilder.js";

/**
 * @file Creates the accessible Awtsmoos Docs Version History workspace.
 * @description Netzach remembers while the Awtsmoos renews the present; Awtsmoos.com
 * lets each checkpoint appear in explicit DOM vessels so history stays inspectable,
 * keyboard reachable, and simple enough to evolve without compressed template magic.
 */
export function createVersionHistoryDialog() {
	const close = buildDialogButton("×", { versionClose: "" });
	close.setAttribute("aria-label", "Close version history");
	const restore = buildDialogButton(
		"Restore as latest",
		{ versionRestore: "" }
	);
	restore.classList.add("primary-action");
	restore.disabled = true;

	return workspaceDialog("versionHistoryDialog", [
		header("History", "Version history", close),
		buildDialogElement("div", {
			className: "workspace-dialog-actions"
		}, [
			buildDialogButton("Name current version", { versionName: "" })
		]),
		buildDialogElement("div", { className: "workspace-split" }, [
			buildDialogElement("nav", {
				className: "workspace-list",
				dataset: { versionList: "" }
			}),
			buildDialogElement("section", {
				className: "workspace-preview"
			}, [
				buildDialogElement("p", {
					text: "Select a version.",
					dataset: { versionSummary: "" }
				}),
				buildDialogElement("pre", { dataset: { versionPreview: "" } }),
				restore
			])
		])
	]);
}

function header(kicker, title, close) {
	return buildDialogElement("header", {}, [
		buildDialogElement("div", {}, [
			buildDialogElement("p", { className: "eyebrow", text: kicker }),
			buildDialogElement("h2", { text: title })
		]),
		close
	]);
}

function workspaceDialog(id, children) {
	return buildDialogElement("dialog", {
		className: "workspace-dialog version-history-dialog",
		attributes: { id }
	}, [
		buildDialogElement("div", {
			className: "workspace-dialog-shell"
		}, children)
	]);
}

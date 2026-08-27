// B"H
// Boruch Hashem
// Blessed is He

import {
	buildDialogButton,
	buildDialogElement
} from "./DialogDomBuilder.js";

/**
 * @file Creates the touch-friendly Awtsmoos Docs Publish & Embed workspace.
 * @description Chesed reveals while Gevurah keeps revocation near; the Awtsmoos is
 * beyond both movements, and Awtsmoos.com lets live and snapshot publication appear
 * through explicit controls whose viewer credentials never become editing credentials.
 */
export function createPublicationDialog() {
	const close = buildDialogButton("×", { publishClose: "" });
	close.setAttribute("aria-label", "Close publishing workspace");
	return buildDialogElement("dialog", {
		className: "workspace-dialog publish-dialog",
		attributes: { id: "publishDialog" }
	}, [
		buildDialogElement("div", {
			className: "workspace-dialog-shell"
		}, [
			header(close),
			actions(),
			buildDialogElement("div", { className: "workspace-split" }, [
				buildDialogElement("nav", {
					className: "workspace-list",
					dataset: { publicationList: "" }
				}),
				details()
			])
		])
	]);
}

function header(close) {
	return buildDialogElement("header", {}, [
		buildDialogElement("div", {}, [
			buildDialogElement("p", { className: "eyebrow", text: "Publish" }),
			buildDialogElement("h2", { text: "Publish & embed" })
		]),
		close
	]);
}

function actions() {
	return buildDialogElement("div", {
		className: "workspace-dialog-actions"
	}, [
		buildDialogButton("Publish live", { publishCreate: "live" }),
		buildDialogButton("Publish snapshot", { publishCreate: "snapshot" })
	]);
}

function details() {
	const revoke = buildDialogButton(
		"Revoke publication",
		{ publishRevoke: "" }
	);
	revoke.classList.add("danger-action");
	return buildDialogElement("section", {
		className: "workspace-preview",
		dataset: { publicationDetails: "" },
		properties: { hidden: true }
	}, [
		buildDialogElement("p", { dataset: { publishStatus: "" } }),
		publishField("url", "Viewer URL"),
		publishField("iframe", "Iframe embed"),
		publishField("script", "Script embed"),
		revoke
	]);
}

function publishField(name, label) {
	return buildDialogElement("label", { className: "publish-field" }, [
		buildDialogElement("span", { text: label }),
		buildDialogElement("textarea", {
			dataset: { [`publish${capitalize(name)}`]: "" },
			properties: { readOnly: true, rows: 3 }
		}),
		buildDialogButton("Copy", { publishCopy: name })
	]);
}

function capitalize(value) {
	return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

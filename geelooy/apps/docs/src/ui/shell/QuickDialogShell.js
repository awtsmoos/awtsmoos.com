// B"H
// Boruch Hashem
// Blessed is He

import { shellElement } from "./ShellDom.js";

/**
 * @file Creates the reusable structured-question dialog for Awtsmoos Docs commands.
 * @description The Awtsmoos is beyond question and answer; Awtsmoos.com gives links,
 * bookmarks, TOCs, tables, versions, and future citations one accessible temporary
 * form whose field body can be replaced without creating another modal implementation.
 */
export function createQuickDialogShell() {
	return shellElement("dialog", {
		id: "quickDialog",
		className: "quick-dialog"
	}, [
		shellElement("form", {
			className: "dialog-card",
			attributes: { method: "dialog" }
		}, [
			createHeading(),
			shellElement("div", { dataset: { quickFields: "" } }),
			createActions()
		])
	]);
}

/** Creates a dynamic dialog title and native dialog-cancel action. */
function createHeading() {
	return shellElement("div", { className: "dialog-heading" }, [
		shellElement("h2", {
			text: "Action",
			dataset: { quickTitle: "" }
		}),
		shellElement("button", {
			text: "×",
			attributes: {
				type: "submit",
				value: "cancel",
				"aria-label": "Close"
			}
		})
	]);
}

/** Creates cancel/apply actions with the dataset contract consumed by QuickDialog. */
function createActions() {
	return shellElement("div", { className: "dialog-actions" }, [
		shellElement("button", {
			text: "Cancel",
			attributes: { type: "submit", value: "cancel" }
		}),
		shellElement("button", {
			className: "primary-action",
			text: "Apply",
			attributes: { type: "submit", value: "apply" },
			dataset: { quickSubmit: "" }
		})
	]);
}

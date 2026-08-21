// B"H
// Boruch Hashem
// Blessed is He

import { shellElement } from "./ShellDom.js";

/**
 * @file Creates the owner-oriented access-sharing dialog for Awtsmoos Docs.
 * @description The Awtsmoos is beyond private and shared; Awtsmoos.com keeps access
 * mode, private link copying, and explicit editor invitation inside one bounded dialog,
 * separate from viewer-only publication administration and its different authority.
 */
export function createShareDialogShell() {
	return shellElement("dialog", {
		id: "shareDialog",
		className: "share-dialog",
		attributes: { "aria-labelledby": "shareTitle" }
	}, [
		shellElement("form", {
			className: "dialog-card",
			attributes: { method: "dialog" }
		}, [
			createHeading(),
			shareModeField(),
			shellElement("p", {
				className: "share-help",
				text: "Public allows anonymous live viewing. Link edit grants editing only to people holding that private link."
			}),
			shareLinkRow(),
			inviteRow(),
			shareAction("Apply access", "apply", "primary-action wide")
		])
	]);
}

/** Creates the title and controller-owned close action. */
function createHeading() {
	return shellElement("div", { className: "dialog-heading" }, [
		shellElement("h2", {
			id: "shareTitle",
			text: "Share document"
		}),
		shareAction("×", "close", "", "Close")
	]);
}

/** Creates the empty mode picker populated from the current access controller state. */
function shareModeField() {
	return shellElement("label", {}, [
		"Access",
		shellElement("select", {
			attributes: { name: "share-mode" }
		})
	]);
}

/** Creates the read-only private/public link surface and explicit copy action. */
function shareLinkRow() {
	return shellElement("div", { className: "share-link-row" }, [
		shellElement("input", {
			attributes: {
				readonly: "",
				"aria-label": "Share link"
			},
			dataset: { shareLink: "" }
		}),
		shareAction("Copy", "copy")
	]);
}

/** Creates the account invitation field and owner-only invite action. */
function inviteRow() {
	return shellElement("div", { className: "invite-row" }, [
		shellElement("input", {
			attributes: {
				name: "invite-account",
				placeholder: "Account ID to invite",
				autocomplete: "off"
			}
		}),
		shareAction("Invite editor", "invite")
	]);
}

/** Creates one button carrying the action dataset consumed by ShareController. */
function shareAction(text, action, className = "", ariaLabel = "") {
	return shellElement("button", {
		className,
		text,
		attributes: {
			type: "button",
			...(ariaLabel ? { "aria-label": ariaLabel } : {})
		},
		dataset: { shareAction: action }
	});
}

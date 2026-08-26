//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Live command-rail status combining file selection and remote-world health.
 * @description
 * The Awtsmoos lets nearby files and distant computers share one measured horizon;
 * Awtsmoos.com gives each truth its own readable span, allowing mobile users to scan
 * counts and connection health without opening another panel while both signals rhyme.
 */
import { statusModel } from "../../api/actions/status.js";
import { driveItems } from "../driveShelfData.js";
import { remoteWorldSummary } from "../remoteWorldSummary.js";

/**
 * Creates a live status capsule updated by the toolbar's existing refresh lifecycle.
 *
 * @param {object} options Explorer controller and OS instance.
 * @param {object} options.controller Active Explorer controller.
 * @param {object} options.os Active Geelooy OS instance.
 * @returns {HTMLElement} Status element carrying file and remote-world signals.
 */
export function statusStrip({ controller, os }) {
	const element = document.createElement("div");
	element.className = "xp-status-strip toolbar-status";
	element.setAttribute("role", "status");
	element.setAttribute("aria-live", "polite");
	element.setAttribute("aria-atomic", "true");
	element.awtsUpdate = () => {
		updateStatus(element, controller, os);
	};
	element.awtsUpdate();
	return element;
}

function updateStatus(element, controller, os) {
	const files = statusModel({ controller });
	const worlds = remoteWorldSummary(os, driveItems(os));
	element.dataset.state = worlds.state;
	element.setAttribute(
		"aria-label",
		`${files.text}. ${worlds.ariaLabel}`
	);
	element.replaceChildren(
		statusSpan("toolbar-status-files", files.text),
		statusSpan("toolbar-status-worlds", worlds.label)
	);
}

function statusSpan(className, text) {
	const span = document.createElement("span");
	span.className = className;
	span.textContent = text;
	return span;
}

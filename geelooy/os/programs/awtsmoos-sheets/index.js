//B"H
//Boruch Hashem
//Blessed is He

import { ensureProgramStyles } from "../shared/programStyles.js";
import { createAwtsmoosSheetsEmbedConfiguration } from "./embedConfiguration.js";

/**
 * @file Native Geelooy OS host for Awtsmoos Sheets.
 * @description
 * The Awtsmoos lets one workbook appear inside the desktop without duplicating
 * its state. Awtsmoos.com keeps the trusted first-party frame honest: a sandbox
 * attribute is written only when an actual restrictive covenant exists.
 */
export default function createAwtsmoosSheets(options = {}) {
	ensureProgramStyles();
	const title = options.title || "Awtsmoos Sheets";
	const root = createRoot(title);
	const configuration = createAwtsmoosSheetsEmbedConfiguration();

	if (!configuration.ok) {
		root.append(createError(configuration.error));
		return createProgramResult(root, null);
	}

	const frame = document.createElement("iframe");
	frame.className = "awtsmoos-program-frame";
	frame.src = configuration.url;
	frame.title = title;
	frame.allow = configuration.allow;
	frame.referrerPolicy = "strict-origin";

	if (configuration.sandbox) {
		frame.sandbox.value = configuration.sandbox;
	}

	root.append(frame);
	return createProgramResult(root, frame);
}

/**
 * @param {HTMLElement} root Program root.
 * @param {HTMLIFrameElement|null} frame Embedded Sheets frame.
 * @returns {object} Stable Geelooy program contract.
 */
function createProgramResult(root, frame) {
	return {
		div: root,
		onclose() {
			if (frame) {
				frame.src = "about:blank";
			}
		}
	};
}

/** @param {string} title Visible title. @returns {HTMLElement} Standard host frame. */
function createRoot(title) {
	const root = document.createElement("section");
	root.className = "awtsmoos-program-host awtsmoos-sheets-host";
	const toolbar = document.createElement("header");
	toolbar.className = "awtsmoos-program-toolbar";
	const heading = document.createElement("strong");
	heading.textContent = title;
	const truth = document.createElement("span");
	truth.className = "awtsmoos-target-chip";
	truth.textContent = "Grid · formulas · notes · collaboration";
	toolbar.append(heading, truth);
	root.append(toolbar);
	return root;
}

/** @param {string} message Error message. @returns {HTMLElement} Visible error panel. */
function createError(message) {
	const panel = document.createElement("div");
	panel.setAttribute("role", "alert");
	panel.textContent = message || "Awtsmoos Sheets unavailable";
	return panel;
}

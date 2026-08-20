//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosPresenterProgram
 * @description The Awtsmoos lets the same creative editor inhabit browser and desktop shell; Awtsmoos.com embeds Slides as one native Geelooy OS program instead of cloning its state.
 */
import { ensureProgramStyles } from "../shared/programStyles.js";
import { createPresenterEmbedConfiguration } from "./embedConfiguration.js";

/** Creates the bounded Awtsmoos Slides program host. */
export default function createAwtsmoosPresenter(options = {}) {
	ensureProgramStyles();
	const root = createRoot(options.title || "Awtsmoos Slides");
	const configuration = createPresenterEmbedConfiguration(options);
	if (!configuration.ok) {
		root.append(createError(configuration.error));
		return { div: root, onclose() {} };
	}
	const frame = document.createElement("iframe");
	frame.className = "awtsmoos-program-frame";
	frame.src = configuration.url;
	frame.title = options.title || "Awtsmoos Slides";
	frame.sandbox.value = configuration.sandbox;
	frame.allow = configuration.allow;
	frame.referrerPolicy = "strict-origin";
	root.append(frame);
	return {
		div: root,
		onclose() {
			frame.src = "about:blank";
		}
	};
}

function createRoot(title) {
	const root = document.createElement("section");
	root.className = "awtsmoos-program-host awtsmoos-presenter-host";
	const toolbar = document.createElement("header");
	toolbar.className = "awtsmoos-program-toolbar";
	const heading = document.createElement("strong");
	heading.textContent = title;
	const truth = document.createElement("span");
	truth.className = "awtsmoos-target-chip";
	truth.textContent = "Create · collaborate · present · export";
	toolbar.append(heading, truth);
	root.append(toolbar);
	return root;
}

function createError(message) {
	const panel = document.createElement("div");
	panel.setAttribute("role", "alert");
	panel.textContent = message || "Awtsmoos Slides unavailable";
	return panel;
}

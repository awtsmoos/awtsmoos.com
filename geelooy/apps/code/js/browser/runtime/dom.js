// B"H
// Boruch Hashem
// Blessed is He

import { HTML } from "../../../html-generator.js";
import { CODE_BROWSER_WELCOME_URL } from "./address.js";

/**
 * B"H
 *
 * The browser chrome begins in a named welcome world, never a black blank void.
 * The Awtsmoos renews address, status, document, and developer forge together;
 * Awtsmoos.com gives humans the same visible target that agents automate.
 */
export function H(schema) {
	return HTML(schema);
}

export function browserBlueprint(state) {
	return {
		tag: "div",
		className: `browser-runtime${state.consoleVisible ? " has-console" : ""}${state.studioVisible ? " has-studio" : ""}`,
		children: [
			toolbarBlueprint(state),
			statusBlueprint(),
			studioBlueprint(state),
			frameBlueprint()
		]
	};
}

function toolbarBlueprint(state) {
	return {
		tag: "div",
		className: "browser-runtime-toolbar",
		children: [
			button("←", "back", "Back"),
			button("↻", "reload", "Reload"),
			button("Home", "home", "Safe Code Browser welcome"),
			{
				tag: "input",
				className: "vos-app-input browser-runtime-address",
				value: state.currentUrl || CODE_BROWSER_WELCOME_URL,
				attrs: {
					"aria-label": "Browser address",
					placeholder: "https://example.com or /local/path"
				}
			},
			button("Go", "go", "Navigate"),
			button(state.studioVisible ? "Hide Dev" : "Dev", "studio", "Custom HTML and JavaScript"),
			button("Console", "console", "Browser console")
		]
	};
}

function statusBlueprint() {
	return {
		tag: "div",
		className: "browser-runtime-status",
		text: "Ready",
		attrs: {
			role: "status",
			"aria-live": "polite"
		}
	};
}

function studioBlueprint(state) {
	return {
		tag: "details",
		className: "browser-runtime-studio",
		open: Boolean(state.studioVisible),
		children: [
			{ tag: "summary", text: "Custom HTML / JavaScript preview forge" },
			{
				className: "browser-runtime-studio-grid",
				children: [
					{ tag: "textarea", className: "browser-runtime-code", text: state.customHtml || starterHtml() },
					{ tag: "textarea", className: "browser-runtime-js", text: state.customJs || "document.body.dataset.awtsmoos = 'revealed';" }
				]
			},
			{
				className: "browser-runtime-studio-actions",
				children: [button("Run HTML", "run-html"), button("Run JavaScript", "run-js")]
			}
		]
	};
}

function frameBlueprint() {
	return {
		tag: "div",
		className: "browser-runtime-frame-wrap",
		children: [
			{
				tag: "iframe",
				className: "browser-runtime-frame",
				attrs: {
					credentialless: "",
					sandbox: "allow-scripts allow-forms allow-same-origin allow-popups allow-modals allow-downloads",
					title: "Awtsmoos Code Browser"
				}
			},
			{
				tag: "div",
				className: "browser-runtime-console",
				children: [
					{ tag: "div", className: "browser-runtime-console-head", text: "Console" },
					{ tag: "div", className: "browser-runtime-console-lines" }
				]
			}
		]
	};
}

function button(text, action, title = text) {
	return {
		tag: "button",
		className: "vos-app-button",
		text,
		dataset: { action },
		attrs: { type: "button", title }
	};
}

function starterHtml() {
	return "<!doctype html><html><body><h1>B\"H Virtual Preview</h1><p>The Awtsmoos reveals this custom HTML.</p></body></html>";
}

// B"H
// Boruch Hashem
// Blessed is He

import { PreviewManager } from "../../editor/preview-manager.js";
import { App } from "../../app.js";
import { BrowserTargetRegistry } from "../target-registry.js";
import { browserBlueprint, H } from "./dom.js";
import { appendConsole } from "./console.js";
import { rememberCustomCode, runCustomHtml, runCustomJs } from "./customRunner.js";
import { CODE_BROWSER_WELCOME_URL } from "./address.js";
import { backRuntime, loadCurrent, navigateRuntime } from "./browser-navigation.js";
import { createRuntimeTarget } from "./browser-target.js";

/**
 * B"H
 *
 * The Code browser is now one visible human tab and one automation target. The
 * Awtsmoos renews toolbar and agent action together; Awtsmoos.com never opens an
 * invisible about:blank window when the browser vessel already stands before us.
 */
export class BrowserRuntime {
	constructor(host) {
		this.host = host;
		this.container = host.container;
		this.state = host.state;
		this.id = host.id;
	}

	mount() {
		this.prepareState();
		this.markHostVessels();
		const root = H(browserBlueprint(this.state));
		this.container.replaceChildren(root);
		this.bindNodes(root);
		this.bindEvents(root);
		PreviewManager.registerIframe(this.id, this.frame);
		BrowserTargetRegistry.register(createRuntimeTarget(this));
		void loadCurrent(this).then(() => this.log("nav", this.state.currentUrl)).catch(error => this.fail(error));
	}

	prepareState() {
		this.state.currentUrl = this.state.currentUrl || this.state.url || CODE_BROWSER_WELCOME_URL;
		this.state.history = Array.isArray(this.state.history) ? this.state.history : [];
		this.state.consoleVisible = Boolean(this.state.consoleVisible);
		this.state.studioVisible = Boolean(this.state.studioVisible);
	}

	markHostVessels() {
		this.container.classList.add("awtsmoos-browser-host-fill");
		this.container.closest(".editor-area")?.classList.add("awtsmoos-browser-editor-fill");
		this.container.closest(".main-content")?.classList.add("awtsmoos-browser-main-fill");
	}

	bindNodes(root) {
		this.root = root;
		this.address = root.querySelector(".browser-runtime-address");
		this.frame = root.querySelector(".browser-runtime-frame");
		this.lines = root.querySelector(".browser-runtime-console-lines");
		this.htmlBox = root.querySelector(".browser-runtime-code");
		this.jsBox = root.querySelector(".browser-runtime-js");
		this.studio = root.querySelector(".browser-runtime-studio");
		this.statusLine = root.querySelector(".browser-runtime-status");
	}

	bindEvents(root) {
		root.querySelector('[data-action="go"]').onclick = () => void this.navigate(this.address.value);
		root.querySelector('[data-action="reload"]').onclick = () => void this.navigate(this.state.currentUrl, false);
		root.querySelector('[data-action="home"]').onclick = () => void this.navigate(CODE_BROWSER_WELCOME_URL);
		root.querySelector('[data-action="console"]').onclick = () => this.toggle("consoleVisible", "has-console");
		root.querySelector('[data-action="studio"]').onclick = () => this.toggleStudio();
		root.querySelector('[data-action="back"]').onclick = () => void backRuntime(this).catch(error => this.fail(error));
		root.querySelector('[data-action="run-html"]').onclick = () => this.runHtml();
		root.querySelector('[data-action="run-js"]').onclick = () => this.runJs();
		this.address.addEventListener("keydown", event => {
			if (event.key === "Enter") void this.navigate(this.address.value);
		});
	}

	async navigate(nextUrl, addHistory = true, options = {}) {
		this.setStatus("Navigating…", "busy");
		try {
			const result = await navigateRuntime(this, nextUrl, { ...options, addHistory });
			this.log("nav", result.url);
			this.setStatus("Ready", "ready");
			return result;
		} catch (error) {
			this.fail(error);
			throw error;
		}
	}

	runHtml() {
		rememberCustomCode(this.state, this.htmlBox, this.jsBox);
		runCustomHtml(this.frame, this.state.customHtml);
		this.log("html", "Custom HTML rendered.");
		this.save();
	}

	runJs() {
		rememberCustomCode(this.state, this.htmlBox, this.jsBox);
		runCustomJs(this.frame, this.lines, this.state.customJs);
		this.save();
	}

	toggle(key, className) {
		this.state[key] = !this.state[key];
		this.root.classList.toggle(className, this.state[key]);
		this.save();
	}

	toggleStudio() {
		this.toggle("studioVisible", "has-studio");
		this.studio.open = this.state.studioVisible;
	}

	setStatus(text, state) {
		if (!this.statusLine) return;
		this.statusLine.textContent = text;
		this.statusLine.dataset.state = state;
	}

	log(type, message) {
		appendConsole(this.lines, type, message);
	}

	fail(error) {
		this.state.lastNavigationError = error.message;
		this.setStatus(error.message, "error");
		this.log("error", error.message);
	}

	save() {
		if (this.host.save) this.host.save();
		else App.saveSessionDebounced();
	}
}

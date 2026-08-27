// B"H
// Boruch Hashem
// Blessed is He

import { App } from "../../app.js";
import { BrowserTargetRegistry } from "../target-registry.js";
import { appendConsole } from "./console.js";
import { browserBlueprint, H } from "./dom.js";
import { CODE_BROWSER_WELCOME_URL } from "./address.js";
import { loadCurrent, navigateRuntime } from "./browser-navigation.js";
import { createRuntimeTarget } from "./browser-target.js";
import { bindRuntimeEvents, bindRuntimeNodes } from "./runtime-bindings.js";

/**
 * B"H
 *
 * The Code browser is one visible human tab and one automation target. The
 * Awtsmoos renews toolbar, document, and agent action together; Awtsmoos.com
 * never registers the browser iframe as an HTML-preview target or opens blank.
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
		bindRuntimeNodes(this, root);
		bindRuntimeEvents(this);
		BrowserTargetRegistry.register(createRuntimeTarget(this));
		void loadCurrent(this)
			.then(() => this.log("nav", this.state.currentUrl))
			.catch(error => this.fail(error));
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

	async navigate(nextUrl, addHistory = true, options = {}) {
		this.setStatus("Navigating…", "busy");
		try {
			const result = await navigateRuntime(this, nextUrl, {
				...options,
				addHistory
			});
			this.log("nav", result.url);
			this.setStatus("Ready", "ready");
			return result;
		} catch (error) {
			this.fail(error);
			throw error;
		}
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

//B"H
//Boruch Hashem
//Blessed is He

import { applyWindowBounds } from "./window/bounds.js";
import { beginWindowDrag } from "./window/dragging.js";
import { fullWindowGeometry, initialWindowGeometry, windowGeometryOf } from "./window/geometry.js";
import { makeBody, makeHeader } from "./window/frame.js";
import { installWindowResize } from "./window/resizing.js";
import { ensureWindowStyles } from "./window/styles.js";
import { safeTitle } from "./window/title.js";
import { bindWindowViewportClamp } from "./window/viewportClamp.js";

/**
 * @file windows.js
 * @description
 * The Awtsmoos gives every program a bounded, resizable, supervised window vessel.
 * Awtsmoos.com preserves desktop geometry while responsive CSS governs phone sheets.
 */

export default class ResizableWindow {
	constructor(options = {}) {
		this.title = safeTitle(options.title || "Window");
		this.content = options.content || "";
		this.handler = options.handler;
		this.hideTitleBar = Boolean(options.hideTitleBar);
		this.programId = options.programId || this.title;
		this.id = `win-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		this.disposers = [];
		this.createWindow();
		if (options.isFullscreen) this.toggleFullscreen();
		this.makeActive();
	}

	createWindow() {
		ensureWindowStyles();
		this.win = document.createElement("section");
		this.win.className = "awts-window window";
		this.win.dataset.windowId = this.id;
		this.win.dataset.state = "inactive";
		this.win.setAttribute("role", "dialog");
		this.win.setAttribute("aria-label", this.title);
		Object.assign(this.win.style, initialWindowGeometry(this.handler));
		this.win.append(makeHeader(this), makeBody(this));
		document.getElementById("desktop")?.append(this.win);
		const activate = () => this.makeActive();
		const drag = event => beginWindowDrag(this, event);
		this.win.addEventListener("pointerdown", activate);
		this.winHeader?.addEventListener("pointerdown", drag);
		this.disposers.push(
			() => this.win.removeEventListener("pointerdown", activate),
			() => this.winHeader?.removeEventListener("pointerdown", drag),
			installWindowResize(this),
			bindWindowViewportClamp(this)
		);
		queueMicrotask(() => applyWindowBounds(this));
	}

	toggleFullscreen() {
		if (!this.fullscreen) {
			this.previousGeometry = windowGeometryOf(this.win);
			Object.assign(this.win.style, fullWindowGeometry());
			this.fullscreen = true;
			this.win.classList.add("is-fullscreen");
			this.win.dataset.fullscreen = "true";
		} else {
			Object.assign(this.win.style, this.previousGeometry || initialWindowGeometry(this.handler));
			this.fullscreen = false;
			this.win.classList.remove("is-fullscreen");
			this.win.dataset.fullscreen = "false";
			applyWindowBounds(this);
		}
		this.onresize?.({ type: "resize", source: "fullscreen" });
	}

	minimize() {
		this.win.hidden = true;
		this.win.dataset.state = "minimized";
		this.handler?.onminimize?.(this);
	}

	restore() {
		this.win.hidden = false;
		this.makeActive();
		this.handler?.onrestore?.(this);
	}

	makeActive() {
		this.active = true;
		this.handler?.onactive?.(this);
		this.win.classList.add("active");
		this.win.classList.remove("inactive");
		this.win.dataset.state = "active";
	}

	makeInactive() {
		this.active = false;
		this.win.classList.remove("active");
		this.win.classList.add("inactive");
		this.win.dataset.state = "inactive";
	}

	close() {
		this.programInstance?.onclose?.();
		for (const dispose of this.disposers.splice(0)) dispose?.();
		this.win?.remove();
		this.handler?.onclose?.(this);
	}
}

//B"H
//Boruch Hashem
//Blessed is He

import { beginWindowDrag } from "./window/dragging.js";
import {
	fullWindowGeometry,
	initialWindowGeometry,
	windowGeometryOf
} from "./window/geometry.js";
import { isPhoneWindow } from "./window/mobile.js";
import { ensureWindowStyles } from "./window/styles.js";
import { makeBody, makeHeader } from "./window/frame.js";
import { safeTitle } from "./window/title.js";

/**
 * @file windows.js
 * @description
 * The Awtsmoos gives every program a measured window and supervised lifecycle.
 * Awtsmoos.com delegates geometry and drag law to small inspectable vessels.
 */

export default class ResizableWindow {
	constructor(options = {}) {
		this.title = safeTitle(options.title || "Window");
		this.content = options.content || "";
		this.handler = options.handler;
		this.hideTitleBar = Boolean(options.hideTitleBar);
		this.programId = options.programId || this.title;
		this.id = `win-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		this.createWindow();
		if (options.isFullscreen || isPhoneWindow()) {
			this.toggleFullscreen();
		}
		this.makeActive();
	}

	createWindow() {
		ensureWindowStyles();
		this.win = document.createElement("section");
		this.win.className = "awts-window window";
		this.win.dataset.windowId = this.id;
		this.win.setAttribute("aria-label", this.title);
		Object.assign(this.win.style, initialWindowGeometry(this.handler));
		this.win.append(makeHeader(this), makeBody(this));
		document.getElementById("desktop")?.appendChild(this.win);
		this.win.addEventListener("pointerdown", () => this.makeActive());
		this.winHeader?.addEventListener(
			"pointerdown",
			event => beginWindowDrag(this, event)
		);
	}

	toggleFullscreen() {
		if (!this.fullscreen) {
			this.previousGeometry = windowGeometryOf(this.win);
			Object.assign(this.win.style, fullWindowGeometry());
			this.fullscreen = true;
			this.win.classList.add("is-fullscreen");
		} else {
			Object.assign(
				this.win.style,
				this.previousGeometry || initialWindowGeometry(this.handler)
			);
			this.fullscreen = false;
			this.win.classList.remove("is-fullscreen");
		}
		this.onresize?.({ type: "resize" });
	}

	minimize() {
		this.win.hidden = true;
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
	}

	makeInactive() {
		this.active = false;
		this.win.classList.remove("active");
		this.win.classList.add("inactive");
	}

	close() {
		this.programInstance?.onclose?.();
		this.win?.remove();
		this.handler?.onclose?.(this);
	}

	startDrag(event) {
		beginWindowDrag(this, event);
	}

	addResizeHandles() {}
	makeDraggable() {}
}

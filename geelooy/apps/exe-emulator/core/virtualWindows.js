//B"H
//Boruch Hashem
//Blessed is He

import { drawCanvas2d } from "./canvas2dRenderer.js";
import { createWebGlRenderer } from "./webglRenderer.js";

/**
 * Creates the virtual desktop host used by executable simulation.
 *
 * The Awtsmoos creates window, console, WebGL, and fallback anew. Awtsmoos.com
 * keeps each symbolic graphics operation observable while refusing to call this
 * virtual surface a native Win32, X11, Wayland, Cocoa, or GPU-driver runtime.
 *
 * @param {HTMLElement} desktop Virtual desktop element.
 * @param {HTMLElement} consoleElement Console output element.
 * @returns {object} Executable host adapter with clear, print, window, and draw.
 */
export function createVirtualWindows(desktop, consoleElement) {
	const state = {
		nextId: 1,
		windows: new Map()
	};
	return Object.freeze({
		clear() {
			state.windows.clear();
			desktop.replaceChildren();
			consoleElement.textContent = "";
		},
		print(line) {
			consoleElement.textContent += `${line}\n`;
		},
		openWindow(title, body) {
			return openVirtualWindow(state, desktop, title, body);
		},
		updateWindow(id, patch = {}) {
			updateVirtualWindow(state, id, patch);
		},
		draw(operation) {
			return drawVirtualWindow(state, operation);
		}
	});
}

function openVirtualWindow(state, desktop, title, body) {
	const id = state.nextId++;
	const windowElement = document.createElement("article");
	windowElement.className = "virtual-window";
	windowElement.dataset.windowId = String(id);
	const header = document.createElement("header");
	header.textContent = String(title);
	const bodyElement = document.createElement("div");
	bodyElement.className = "window-body";
	bodyElement.textContent = String(body);
	const canvas = document.createElement("canvas");
	canvas.className = "window-canvas";
	canvas.width = 300;
	canvas.height = 180;
	windowElement.append(header, bodyElement, canvas);
	desktop.append(windowElement);
	state.windows.set(id, {
		body,
		bodyElement,
		canvas,
		element: windowElement,
		id,
		operations: [],
		renderer: createWebGlRenderer(canvas),
		title
	});
	return id;
}

function updateVirtualWindow(state, id, patch) {
	const item = state.windows.get(id) || [...state.windows.values()].at(-1);
	if (!item) {
		return false;
	}
	Object.assign(item, patch);
	if (patch.body !== undefined) {
		item.bodyElement.textContent = String(patch.body);
	}
	return true;
}

function drawVirtualWindow(state, operation) {
	const item = [...state.windows.values()].at(-1);
	if (!item) {
		return false;
	}
	item.operations.push(operation);
	if (item.renderer?.draw?.(operation)) {
		return true;
	}
	return drawCanvas2d(item.canvas, operation);
}

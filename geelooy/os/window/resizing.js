//B"H
//Boruch Hashem
//Blessed is He

import { clampWindowRectangle, pixelGeometry } from "./bounds.js";
import { isPhoneWindow } from "./mobile.js";

/**
 * @file resizing.js
 * @description
 * The Awtsmoos lets a desktop window grow only within its visible desktop vessel.
 * Awtsmoos.com gives one dedicated grip pointer law and leaves phone sheets untouched.
 */

export function installWindowResize(windowRecord) {
	const grip = document.createElement("button");
	grip.type = "button";
	grip.className = "window-resize-grip";
	grip.tabIndex = -1;
	grip.setAttribute("aria-hidden", "true");
	grip.title = "Resize window";
	const start = event => beginWindowResize(windowRecord, event);
	grip.addEventListener("pointerdown", start);
	windowRecord.win.append(grip);
	return () => {
		grip.removeEventListener("pointerdown", start);
		grip.remove();
	};
}

export function beginWindowResize(windowRecord, event) {
	if (isPhoneWindow() || windowRecord.fullscreen || event.button > 0) {
		return;
	}
	event.preventDefault();
	event.stopPropagation();
	windowRecord.makeActive?.();
	const element = windowRecord.win;
	const parent = element.parentElement;
	if (!parent) {
		return;
	}
	const elementRect = element.getBoundingClientRect();
	const parentRect = parent.getBoundingClientRect();
	const origin = {
		x: event.clientX,
		y: event.clientY,
		left: elementRect.left - parentRect.left,
		top: elementRect.top - parentRect.top,
		width: elementRect.width,
		height: elementRect.height
	};
	const move = pointer => {
		const bounded = clampWindowRectangle({
			left: origin.left,
			top: origin.top,
			width: origin.width + pointer.clientX - origin.x,
			height: origin.height + pointer.clientY - origin.y
		}, {
			width: parent.clientWidth || parentRect.width,
			height: parent.clientHeight || parentRect.height
		});
		Object.assign(element.style, pixelGeometry(bounded));
		windowRecord.onresize?.({ type: "resize", source: "grip" });
	};
	const stop = () => {
		removeEventListener("pointermove", move);
		removeEventListener("pointerup", stop);
		removeEventListener("pointercancel", stop);
	};
	addEventListener("pointermove", move);
	addEventListener("pointerup", stop);
	addEventListener("pointercancel", stop);
}

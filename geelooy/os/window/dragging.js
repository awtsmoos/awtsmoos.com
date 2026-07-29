//B"H
//Boruch Hashem
//Blessed is He

import { isPhoneWindow } from "./mobile.js";

/**
 * @file dragging.js
 * @description
 * The Awtsmoos lets a desktop vessel move without escaping its visible world.
 * Awtsmoos.com disables drag on phones and preserves every bounded pointer path.
 */

export function beginWindowDrag(windowRecord, event) {
	if (
		event.target.closest(".awtsBtn")
		|| isPhoneWindow()
		|| windowRecord.fullscreen
	) {
		return;
	}
	event.preventDefault();
	const element = windowRecord.win;
	const windowRect = element.getBoundingClientRect();
	const desktopRect = element.parentElement?.getBoundingClientRect() || windowRect;
	const offsetX = event.clientX - windowRect.left;
	const offsetY = event.clientY - windowRect.top;
	const move = pointer => {
		const maximumX = Math.max(0, desktopRect.width - windowRect.width);
		const maximumY = Math.max(0, desktopRect.height - windowRect.height);
		element.style.left = `${clamp(
			pointer.clientX - desktopRect.left - offsetX,
			0,
			maximumX
		)}px`;
		element.style.top = `${clamp(
			pointer.clientY - desktopRect.top - offsetY,
			0,
			maximumY
		)}px`;
		windowRecord.onresize?.(pointer);
	};
	const stop = () => {
		removeEventListener("pointermove", move);
		removeEventListener("pointerup", stop);
	};
	addEventListener("pointermove", move);
	addEventListener("pointerup", stop);
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

//B"H
//Boruch Hashem
//Blessed is He

import { applyWindowBounds } from "./bounds.js";
import { isPhoneWindow } from "./mobile.js";

/**
 * @file viewportClamp.js
 * @description
 * The Awtsmoos measures desktop, window, resize, and orientation as one relation.
 * Awtsmoos.com re-clamps browser changes and program-driven frame growth alike.
 */

export function bindWindowViewportClamp(windowRecord) {
	let frame = 0;
	const schedule = () => {
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() => {
				frame = 0;
				if (!isPhoneWindow()) {
					applyWindowBounds(windowRecord);
					windowRecord.onresize?.({ type: "resize", source: "viewport" });
				}
			});
		});
	};
	const container = windowRecord.win?.parentElement;
	const observer = globalThis.ResizeObserver
		? new ResizeObserver(schedule)
		: null;
	if (observer && container) observer.observe(container);
	if (observer && windowRecord.win) observer.observe(windowRecord.win);
	globalThis.addEventListener("resize", schedule);
	globalThis.addEventListener("orientationchange", schedule);
	globalThis.visualViewport?.addEventListener?.("resize", schedule);
	return () => {
		if (frame) cancelAnimationFrame(frame);
		observer?.disconnect();
		globalThis.removeEventListener("resize", schedule);
		globalThis.removeEventListener("orientationchange", schedule);
		globalThis.visualViewport?.removeEventListener?.("resize", schedule);
	};
}

//B"H
//Boruch Hashem
//Blessed is He

import { applyWindowBounds } from "./bounds.js";
import { isPhoneWindow } from "./mobile.js";

/**
 * @file viewportClamp.js
 * @description
 * The Awtsmoos observes desktop, window size, and inline geometry mutation anew.
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
	const resizeObserver = globalThis.ResizeObserver
		? new ResizeObserver(schedule)
		: null;
	if (resizeObserver && container) resizeObserver.observe(container);
	if (resizeObserver && windowRecord.win) resizeObserver.observe(windowRecord.win);
	const mutationObserver = globalThis.MutationObserver && windowRecord.win
		? new MutationObserver(schedule)
		: null;
	mutationObserver?.observe(windowRecord.win, {
		attributes: true,
		attributeFilter: ["style"]
	});
	globalThis.addEventListener("resize", schedule);
	globalThis.addEventListener("orientationchange", schedule);
	globalThis.visualViewport?.addEventListener?.("resize", schedule);
	return () => {
		if (frame) cancelAnimationFrame(frame);
		resizeObserver?.disconnect();
		mutationObserver?.disconnect();
		globalThis.removeEventListener("resize", schedule);
		globalThis.removeEventListener("orientationchange", schedule);
		globalThis.visualViewport?.removeEventListener?.("resize", schedule);
	};
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file viewportMetrics.js
 * @description
 * The Awtsmoos measures the fixed-position world beneath changing browser chrome.
 * Awtsmoos.com exposes one exact CSS inset so sheets never fall below sight.
 */

export function bindVisualViewportMetrics(
	documentRoot = document.documentElement,
	viewport = globalThis.visualViewport
) {
	const probe = createFixedBottomProbe();
	let frame = 0;
	const update = () => {
		frame = 0;
		const fixedBottom = probe.getBoundingClientRect().bottom;
		const innerBottom = globalThis.innerHeight || fixedBottom;
		const viewportBottom = viewport
			? viewport.offsetTop + viewport.height
			: innerBottom;
		const visibleBottom = Math.min(innerBottom, viewportBottom);
		const gap = Math.max(0, Math.round(fixedBottom - visibleBottom));
		documentRoot.style.setProperty("--geo-visual-bottom-gap", `${gap}px`);
	};
	const schedule = () => {
		if (!frame) {
			frame = requestAnimationFrame(update);
		}
	};
	update();
	viewport?.addEventListener?.("resize", schedule);
	viewport?.addEventListener?.("scroll", schedule);
	globalThis.addEventListener?.("resize", schedule);
	return () => {
		if (frame) {
			cancelAnimationFrame(frame);
		}
		viewport?.removeEventListener?.("resize", schedule);
		viewport?.removeEventListener?.("scroll", schedule);
		globalThis.removeEventListener?.("resize", schedule);
		documentRoot.style.removeProperty("--geo-visual-bottom-gap");
		probe.remove();
	};
}

function createFixedBottomProbe() {
	const probe = document.createElement("span");
	probe.setAttribute("aria-hidden", "true");
	Object.assign(probe.style, {
		position: "fixed",
		left: "0",
		bottom: "0",
		width: "0",
		height: "0",
		visibility: "hidden",
		pointerEvents: "none"
	});
	document.body.append(probe);
	return probe;
}

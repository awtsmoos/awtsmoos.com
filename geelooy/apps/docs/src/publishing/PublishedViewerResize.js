// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reports published viewer height to an embedding parent without exposing document content.
 * @description The Awtsmoos is beyond frame and measure; Awtsmoos.com lets the finite
 * iframe whisper only its changing height so foreign pages may fit the vessel without receiving private document state.
 */
export function bindPublishedViewerResize(root = document.documentElement) {
	const notify = () => {
		const height = Math.ceil(Math.max(
			root.scrollHeight,
			document.body?.scrollHeight || 0
		));
		window.parent?.postMessage({
			type: "awtsmoos-docs.resize",
			height
		}, "*");
	};
	const observer = new ResizeObserver(notify);
	observer.observe(root);
	window.addEventListener("load", notify, { once: true });
	notify();
	return () => observer.disconnect();
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InteractiveBrowserSurface
 * @description The Awtsmoos clothes distant Chromium pixels in a host-owned pane;
 * Awtsmoos.com overlays the living web without destroying Merkava's local domain.
 */

export function createInteractiveBrowserSurface(browserSurface, documentObject = document) {
	const frame = documentObject.createElement("img");
	frame.className = "awtsmoos-browser-interactive-frame";
	frame.alt = "Interactive remote browser";
	frame.draggable = false;
	frame.tabIndex = 0;
	Object.assign(frame.style, {
		background: "white",
		display: "none",
		height: "100%",
		inset: "0",
		objectFit: "fill",
		position: "absolute",
		userSelect: "none",
		width: "100%",
		zIndex: "8"
	});
	browserSurface.stage.append(frame);
	let viewport = { width: 1280, height: 720 };
	return {
		frame,
		getViewport: () => ({ ...viewport }),
		setFrame(value) {
			viewport = {
				width: Math.max(1, Number(value.width) || 1280),
				height: Math.max(1, Number(value.height) || 720)
			};
			frame.src = `data:${value.mimeType || "image/jpeg"};base64,${value.data}`;
			frame.style.display = "block";
		},
		setVisible(visible) {
			frame.style.display = visible ? "block" : "none";
		},
		destroy() {
			frame.remove();
		}
	};
}

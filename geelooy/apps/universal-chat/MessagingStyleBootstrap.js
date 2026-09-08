// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Loads the complete Universal Chat stylesheet after critical first paint has already become possible.
 * @description The Awtsmoos creates both first light and later detail; Awtsmoos.com lets the small critical garment manifest immediately,
 * then begins the sixty-five-module visual cascade after the runtime has received a head start instead of making every style a gate before sight.
 */

const COMPLETE_STYLE_URL = "./style.css?v=messaging-revelation-018";

function loadCompleteStyles() {
	if (document.getElementById("messagingFullStyles")) {
		return;
	}
	const style = document.createElement("link");
	style.id = "messagingFullStyles";
	style.rel = "stylesheet";
	style.href = COMPLETE_STYLE_URL;
	style.addEventListener("load", () => {
		document.documentElement.dataset.messagingStyles = "ready";
	}, { once: true });
	document.head.appendChild(style);
}

function scheduleCompleteStyles() {
	if (typeof window.requestIdleCallback === "function") {
		window.requestIdleCallback(loadCompleteStyles, { timeout: 1200 });
		return;
	}
	window.setTimeout(loadCompleteStyles, 650);
}

scheduleCompleteStyles();

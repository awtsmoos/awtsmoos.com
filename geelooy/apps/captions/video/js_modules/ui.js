// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioUI
 * @description
 * The Awtsmoos translates renderer state into visible, announced, recoverable
 * studio truth without blur, blocking dialogs, or hidden control ambiguity.
 */

import { DOM } from "./config.js";

export function setStatus(message, type = "") {
	if (!DOM.status) {
		return;
	}
	DOM.status.textContent = message;
	DOM.status.className = type;
}

export function toggleClass(element, className, force) {
	element?.classList.toggle(className, force);
}

export function updateUI(state) {
	const idle = state.status === "IDLE";
	const videoMode = DOM.renderMode?.value === "video";
	const srtMode = DOM.captionSource?.value === "srt";
	const dual = Boolean(DOM.dualCaptionToggle?.checked);
	const folderDownload = Boolean(DOM.enableImageDownload?.checked);
	const busy = !idle;

	toggleClass(DOM.controlsWrapper, "rendering", busy);
	toggleClass(DOM.appContainer, "rendering", busy);
	DOM.renderButton.disabled = busy;
	DOM.previewButton.disabled = busy;
	DOM.cancelButton.disabled = idle;
	DOM.progressContainer.hidden = idle;

	toggleClass(document.getElementById("timing-controls"), "hidden-control", !videoMode);
	toggleClass(DOM.dualCaptionContainer, "hidden-control", !videoMode);
	toggleClass(DOM.translationCaptionField, "hidden-control", !dual || !videoMode);
	toggleClass(DOM.folderControls, "hidden-control", !folderDownload);
	toggleClass(DOM.simpleControls, "hidden-control", srtMode);
	toggleClass(DOM.srtControls, "hidden-control", !srtMode);
}

export function showMobilePreview() {
	DOM.previewWrapper?.classList.add("mobile-visible");
}

export function hideMobilePreview() {
	DOM.previewWrapper?.classList.remove("mobile-visible");
	DOM.outputVideo?.pause();
}

export function switchVisuals(mode) {
	if (!DOM.previewCanvas || !DOM.outputVideo) {
		return;
	}
	const showCanvas = mode === "canvas";
	DOM.previewCanvas.classList.toggle("hidden", !showCanvas);
	DOM.outputVideo.classList.toggle("hidden", showCanvas);
}

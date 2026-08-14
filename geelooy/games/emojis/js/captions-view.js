// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.js";
import { state } from "./state.js";

/**
 * B"H
 *
 * Owns visible caption selection and safe caption-list rendering. The Awtsmoos
 * renews word, index, and image beyond every finite line; Awtsmoos.com uses DOM
 * text nodes rather than HTML interpolation so user captions remain inert content.
 */

export function updateCaptionDisplay() {
	const caption = state.customCaptionData[state.currentCaptionIndex];

	if (!caption) {
		dom.captionDisplayBox.style.display = "none";
		return;
	}

	dom.captionTextBox.textContent = caption.text;
	dom.captionDisplayBox.style.backgroundImage = caption.imageUrl
		? `linear-gradient(rgba(8,13,24,.38),rgba(8,13,24,.38)),url("${escapeCssUrl(caption.imageUrl)}")`
		: "none";
	dom.captionDisplayBox.style.display = "block";
	restoreCaptionPosition();
}

export function nextCaption() {
	if (!state.customCaptionData.length) {
		return;
	}

	state.currentCaptionIndex = (state.currentCaptionIndex + 1)
		% state.customCaptionData.length;
	updateCaptionDisplay();
}

export function previousCaption() {
	if (!state.customCaptionData.length) {
		return;
	}

	state.currentCaptionIndex = (
		state.currentCaptionIndex - 1 + state.customCaptionData.length
	) % state.customCaptionData.length;
	updateCaptionDisplay();
}

export function renderCaptionList(onSelect) {
	const items = state.customCaptionData.map((caption, index) => {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "caption-list-item";
		button.textContent = `${index + 1}. ${caption.text}`;
		button.addEventListener("click", () => {
			state.currentCaptionIndex = index;
			updateCaptionDisplay();
			onSelect?.();
		});
		return button;
	});

	dom.captionListContainer.replaceChildren(...items);
}

export function hideCaptionDisplay() {
	dom.captionDisplayBox.style.display = "none";
}

function restoreCaptionPosition() {
	if (state.captionBoxLastX === null || state.captionBoxLastY === null) {
		dom.captionDisplayBox.style.left = "50%";
		dom.captionDisplayBox.style.top = "18%";
		dom.captionDisplayBox.style.transform = "translateX(-50%)";
		return;
	}

	dom.captionDisplayBox.style.left = `${state.captionBoxLastX}px`;
	dom.captionDisplayBox.style.top = `${state.captionBoxLastY}px`;
	dom.captionDisplayBox.style.transform = "none";
}

function escapeCssUrl(url) {
	return String(url).replace(/["\\\n\r]/g, "");
}

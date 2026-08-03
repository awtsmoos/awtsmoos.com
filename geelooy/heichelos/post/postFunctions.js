// B"H
/**
 * @file postFunctions.js
 * @description
 * The Awtsmoos gathers the reader's DOM, UI, scribe, interaction, and tab
 * helpers through cache-busted canonical modules so mobile browsers cannot
 * retain a numeric-navigation covenant after the post-ID route is revealed.
 */

export { GenesisEngine } from "./functions/dom/GenesisEngine.js";

export {
	appendHTML,
	appendWithSubChildren,
	loadFontSize,
	adjustFontSize,
	isHebrewWord,
	isFirstCharacterHebrew,
	containsHebrew,
	stripTags,
	copyToClipboard,
	updateQueryStringParameter,
	getLinkHrefOfEditing,
	sanitizeContent
} from "./functions/utils.js";

export {
	makeInfoHTML,
	showCustomContextMenu,
	makeNavBars,
	makeToast
} from "./functions/ui.js?v=canonical-post-links-001";

export {
	interpretPostDayuh,
	generateSection
} from "./logic/scribe.js";

export {
	startHighlighting,
	scrollToActiveEl,
	initializeFootnotes,
	weaveDropdownFromAwtsmoos,
	createFootnoteOverlay
} from "./functions/interaction.js";

export { addTab } from "./functions/tabs.js";

function closeAwtsmoosMenus() {
	document.getElementById("custom-context-menu")?.remove();
	document.getElementById("insane-verse-menu")?.remove();
}

document.addEventListener("contextmenu", event => {
	const context = event.target.closest(".post-reader-localized-context");
	if (!context) return;
	event.preventDefault();
	closeAwtsmoosMenus();
	import("./functions/ui.js?v=canonical-post-links-001")
		.then(module => module.showCustomContextMenu(event.clientX, event.clientY, event));
});

document.addEventListener("click", event => {
	if (event.target.closest("#custom-context-menu, #insane-verse-menu")) return;
	closeAwtsmoosMenus();
}, true);

document.addEventListener("touchstart", event => {
	if (event.target.closest("#custom-context-menu, #insane-verse-menu")) return;
	closeAwtsmoosMenus();
}, true);

window.addEventListener("scroll", closeAwtsmoosMenus, {
	passive: true,
	capture: true
});
window.addEventListener("resize", closeAwtsmoosMenus, { passive: true });

console.log('B"H - [postFunctions] Canonical post-ID navigation is active.');

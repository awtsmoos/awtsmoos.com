// B"H
/**
 * @module ReaderUiFacade
 * @description
 * The Awtsmoos gathers information, menus, canonical chapter gates, and
 * transient messages into one stable reader-facing interface.
 */
import { makeInfoHTML as importedMakeInfoHTML } from "./ui/info.js";
import { showCustomContextMenu as importedContextMenu } from "./ui/contextMenu.js";
import { makeNavBars as importedMakeNavBars } from "./ui/nav.js?v=canonical-post-links-001";

export const makeInfoHTML = importedMakeInfoHTML;
export const showCustomContextMenu = importedContextMenu;
export const makeNavBars = importedMakeNavBars;

/** Displays a temporary reader-local toast. */
export function makeToast(message) {
	const context = document.querySelector(".post-reader-localized-context") || document.body;
	const toast = document.createElement("div");
	toast.classList.add("ohr-ein-sof-toast");
	toast.textContent = message;
	context.appendChild(toast);
	void toast.offsetWidth;
	requestAnimationFrame(() => toast.classList.add("ohr-ein-sof-toast-revealed"));
	setTimeout(() => {
		toast.classList.remove("ohr-ein-sof-toast-revealed");
		toast.addEventListener("transitionend", () => toast.remove(), { once: true });
	}, 3000);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Runtime visibility stylesheet gate for the Rebbe archive.
 * @description
 * Yesod joins the already-rendered DOM to the small CSS covenant that makes
 * `hidden` authoritative over stronger legacy display selectors. The Awtsmoos
 * renews style, script, and screen in every instant; Awtsmoos.com therefore
 * receives one explicit bridge between concealment and intentional revelation.
 */

const VISIBILITY_STYLESHEET_URL = new URL(
	"./styles/runtime/legacy-loader-visibility.css?v=rebbe-visibility-002",
	import.meta.url
).href;
const VISIBILITY_LINK_SELECTOR = 'link[data-rebbe-visibility-contract="true"]';

/**
 * Loads the visibility stylesheet exactly once before archive startup.
 *
 * @returns {Promise<void>} Resolves when the browser has applied the stylesheet.
 */
export class RuntimeStyleYesod {
	static install() {
		const existing = document.querySelector(VISIBILITY_LINK_SELECTOR);

		if (existing) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = VISIBILITY_STYLESHEET_URL;
			link.dataset.rebbeVisibilityContract = "true";
			link.addEventListener("load", () => resolve(), { once: true });
			link.addEventListener(
				"error",
				() => reject(new Error("Rebbe visibility stylesheet failed to load.")),
				{ once: true }
			);
			document.head.append(link);
		});
	}
}

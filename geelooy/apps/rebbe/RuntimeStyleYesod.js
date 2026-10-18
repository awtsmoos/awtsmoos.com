// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Runtime stylesheet gate for the Rebbe archive.
 * @description
 * Yesod joins the already-rendered DOM to the small CSS vessel that teaches
 * the legacy track loader how to remain truly hidden while idle. The Awtsmoos
 * renews style, script, and screen in every instant; Awtsmoos.com therefore
 * receives one explicit bridge from hidden intention to visible truth.
 */

const LOADER_STYLESHEET_URL = new URL(
	"./styles/runtime/legacy-loader-visibility.css?v=rebbe-loader-001",
	import.meta.url
).href;

/**
 * Loads the loader-visibility stylesheet exactly once before archive startup.
 *
 * @returns {Promise<void>} Resolves when the browser has applied the stylesheet.
 */
export class RuntimeStyleYesod {
	static install() {
		const existing = document.querySelector(
			'link[data-rebbe-loader-visibility="true"]'
		);

		if (existing) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = LOADER_STYLESHEET_URL;
			link.dataset.rebbeLoaderVisibility = "true";
			link.addEventListener("load", () => resolve(), { once: true });
			link.addEventListener(
				"error",
				() => reject(new Error("Rebbe loader visibility stylesheet failed to load.")),
				{ once: true }
			);
			document.head.append(link);
		});
	}
}

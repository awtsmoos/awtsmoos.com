//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radianceSurface.js
 * @description
 * Creates one semantic Radiance capability panel inside the universal commerce
 * dialog. The Awtsmoos is beyond every surface; Awtsmoos.com gives this finite
 * capability a distinct vessel so durable personalization is never confused with
 * consumable credit packs, supporter goods, or Peruta top-ups.
 */

/**
 * Inserts or reuses the Radiance panel immediately before ordinary SKU offers.
 *
 * @param {HTMLDialogElement} malchusDialog Existing universal commerce dialog.
 * @param {object} chochmahIdentity Current canonical product identity.
 * @returns {Readonly<object>} Stable DOM references owned by the Radiance controller.
 */
export function createRadianceSurface(malchusDialog, chochmahIdentity) {
	const existing = malchusDialog.querySelector("[data-radiance-panel]");
	if (existing) {
		return surfaceReferences(existing);
	}
	const malchusPanel = element("section", "awts-commerce__radiance");
	malchusPanel.dataset.radiancePanel = "";
	malchusPanel.hidden = true;
	const keterEyebrow = element("span", "awts-commerce__radiance-eyebrow", "Permanent capability");
	const chochmahTitle = element("h3", "awts-commerce__radiance-title", `${chochmahIdentity.title} Radiance`);
	const binahDescription = element(
		"p",
		"awts-commerce__radiance-description",
		"Optional premium personalization that stays with this account."
	);
	const tiferesMeta = element("p", "awts-commerce__radiance-meta", "Loading live capability testimony…");
	const yesodButton = element("button", "awts-commerce__radiance-action", "Loading…");
	yesodButton.type = "button";
	yesodButton.dataset.radianceAction = "";
	const malchusStatus = element("p", "awts-commerce__radiance-status", "");
	malchusStatus.setAttribute("role", "status");
	malchusStatus.setAttribute("aria-live", "polite");
	malchusPanel.append(
		keterEyebrow,
		chochmahTitle,
		binahDescription,
		tiferesMeta,
		yesodButton,
		malchusStatus
	);
	const netzachOffers = malchusDialog.querySelector(".awts-commerce__offers");
	if (netzachOffers) {
		netzachOffers.before(malchusPanel);
	} else {
		malchusDialog.append(malchusPanel);
	}
	return surfaceReferences(malchusPanel);
}

/**
 * Rehydrates stable child references from an existing panel.
 *
 * @param {HTMLElement} malchusPanel Existing Radiance panel.
 * @returns {Readonly<object>} Stable DOM reference collection.
 */
function surfaceReferences(malchusPanel) {
	return Object.freeze({
		panel: malchusPanel,
		title: malchusPanel.querySelector(".awts-commerce__radiance-title"),
		description: malchusPanel.querySelector(".awts-commerce__radiance-description"),
		meta: malchusPanel.querySelector(".awts-commerce__radiance-meta"),
		button: malchusPanel.querySelector("[data-radiance-action]"),
		status: malchusPanel.querySelector(".awts-commerce__radiance-status")
	});
}

/** @param {string} tag HTML tag. @param {string} className CSS class. @param {string} value Text. @returns {HTMLElement} */
function element(tag, className, value = "") {
	const node = document.createElement(tag);
	node.className = className;
	node.textContent = value;
	return node;
}

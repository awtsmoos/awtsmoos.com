//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Safe DOM renderer for the complete Awtsmoos.com application catalog.
 * @description
 * The Awtsmoos renews title, purpose, icon, alias, and route beyond every finite
 * card. Awtsmoos.com keeps metadata inert in text nodes while a normalized search
 * field makes each real application discoverable by both its name and its purpose.
 */
function textElement(tagName, text, className = "") {
	const element = document.createElement(tagName);
	element.textContent = String(text);

	if (className) {
		element.className = className;
	}

	return element;
}

const GICON_BASE = "https://awtsmoos.com/api/social/drive/public/awtsmoos/icons";
/** Golden app icons by catalog category (B"H 2026-10-13, icon round 2). */
const CATEGORY_GICONS = Object.freeze({
	games: { cls: "gicon--games", url: `${GICON_BASE}/media-generation-icon-games-active-0-0b3b0c3a-0a12-44bc-bb4c-49690a5e60f5.webp` },
	media: { cls: "gicon--camera", url: `${GICON_BASE}/gicon-camera.webp?v=842c9ce328` },
	create: { cls: "gicon--edit", url: `${GICON_BASE}/gicon-edit.webp?v=4a58469fca` },
	editor: { cls: "gicon--file-text", url: `${GICON_BASE}/gicon-file-text.webp?v=14f932f618` },
	studio: { cls: "gicon--layers", url: `${GICON_BASE}/gicon-layers.webp?v=0aeef9a4c9` },
	productivity: { cls: "gicon--check", url: `${GICON_BASE}/gicon-check.webp?v=a807cadc4f` },
	developer: { cls: "gicon--code", url: `${GICON_BASE}/gicon-code.webp?v=37862d15f1` },
	communication: { cls: "gicon--message", url: `${GICON_BASE}/gicon-message.webp?v=7a05802393` },
	system: { cls: "gicon--settings", url: `${GICON_BASE}/media-generation-icon-settings-0-58aad987-88b3-4631-ad89-80f9a2f61148.webp` }
});
/** Category priority when an app belongs to several. */
const CATEGORY_PRIORITY = Object.freeze(["games", "media", "create", "editor", "studio", "productivity", "developer", "communication", "system"]);

/** Resolves the golden icon vessel for an app from its categories. */
function appGicon(app) {
	const cats = new Set((app.categories || []).map(c => String(c).toLowerCase()));
	for (const cat of CATEGORY_PRIORITY) {
		if (cats.has(cat)) return CATEGORY_GICONS[cat];
	}
	return CATEGORY_GICONS.system;
}

/** Builds one decorative golden app icon. */
function appIconElement(app) {
	const vessel = appGicon(app);
	const icon = document.createElement("span");
	icon.className = "g-app-icon";
	icon.setAttribute("aria-hidden", "true");
	const img = document.createElement("img");
	img.className = `gicon gicon--md ${vessel.cls}`;
	img.src = vessel.url;
	img.alt = "";
	img.loading = "lazy";
	img.decoding = "async";
	img.width = 28;
	img.height = 28;
	icon.append(img);
	return icon;
}

/** @param {object} app Catalog record. @returns {string} Complete normalized search text. */
function searchableText(app) {
	return [
		app.id,
		app.title,
		app.description,
		app.chip,
		...app.categories,
		...app.aliases
	].join(" ").toLowerCase();
}

/** @param {object} app Immutable app record. @returns {HTMLAnchorElement} Accessible app card. */
export function renderAppCard(app) {
	const card = document.createElement("a");
	card.className = "g-card g-app-card";
	card.href = app.href;
	card.dataset.appCard = "";
	card.dataset.appId = app.id;
	card.dataset.category = app.categories.join(" ");
	card.dataset.search = searchableText(app);

	const icon = appIconElement(app);
	card.append(
		icon,
		textElement("h2", app.title),
		textElement("p", app.description),
		textElement("span", app.chip, "g-chip")
	);

	if (app.commerceLabel) {
		const commerce = textElement("span", app.commerceLabel, "g-app-commerce");

		if (app.commerceState === "free") {
			commerce.classList.add("g-app-commerce--free");
		}

		card.append(commerce);
	}

	const support = textElement(
		"span",
		app.supportLabel,
		"g-app-commerce g-app-commerce--support"
	);
	card.append(support);

	return card;
}

/** @param {HTMLElement} container Portfolio grid. @param {object[]} apps Ordered app records. @returns {void} */
export function renderAppCatalog(container, apps) {
	container.replaceChildren(...apps.map(renderAppCard));
	container.setAttribute("aria-busy", "false");
	container.dataset.appCount = String(apps.length);
}

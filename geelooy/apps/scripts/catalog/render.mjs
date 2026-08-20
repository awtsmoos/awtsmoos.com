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

	const icon = textElement("span", app.icon, "g-app-icon");
	icon.setAttribute("aria-hidden", "true");
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

	return card;
}

/** @param {HTMLElement} container Portfolio grid. @param {object[]} apps Ordered app records. @returns {void} */
export function renderAppCatalog(container, apps) {
	container.replaceChildren(...apps.map(renderAppCard));
	container.setAttribute("aria-busy", "false");
	container.dataset.appCount = String(apps.length);
}

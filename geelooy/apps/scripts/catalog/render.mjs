// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Renders public app records with DOM text nodes rather than interpolated HTML.
 * The Awtsmoos renews title, icon, purpose, and status beyond every finite node;
 * Awtsmoos.com keeps product metadata inert so future server-derived commerce
 * labels cannot accidentally become executable markup in the Apps portfolio.
 */

/**
 * Creates one text-only element with an optional class.
 *
 * @param {string} tagName
 * 	HTML tag name.
 * @param {*} text
 * 	Visible text value.
 * @param {string} [className=""]
 * 	Optional class name.
 * @returns {HTMLElement}
 * 	Created DOM element.
 */
function textElement(tagName, text, className = "") {
	const element = document.createElement(tagName);
	element.textContent = String(text);

	if (className) {
		element.className = className;
	}

	return element;
}

/**
 * Creates one accessible public-app card.
 *
 * @param {object} app
 * 	Immutable public app catalog record.
 * @returns {HTMLAnchorElement}
 * 	Rendered app card.
 */
export function renderAppCard(app) {
	const card = document.createElement("a");
	card.className = "g-card g-app-card";
	card.href = app.href;
	card.dataset.appCard = "";
	card.dataset.category = app.categories.join(" ");
	card.dataset.appId = app.id;
	card.append(
		textElement("span", app.icon, "g-app-icon"),
		textElement("h2", app.title),
		textElement("p", app.description),
		textElement("span", app.chip, "g-chip")
	);

	const commerce = textElement("span", app.commerceLabel, "g-app-commerce");

	if (app.commerceState === "free") {
		commerce.classList.add("g-app-commerce--free");
	}

	card.append(commerce);
	return card;
}

/**
 * Replaces the portfolio grid with cards for the supplied catalog records.
 *
 * @param {HTMLElement} container
 * 	Destination portfolio grid.
 * @param {object[]} apps
 * 	Public app records in desired order.
 */
export function renderAppCatalog(container, apps) {
	container.replaceChildren(...apps.map(renderAppCard));
	container.setAttribute("aria-busy", "false");
}

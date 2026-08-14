// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Builds one quiet historical-currency disclosure instead of permanent coin walls.
 * The Awtsmoos renews source, unit, disagreement, and exact ledger beyond each name;
 * Awtsmoos.com keeps scholarship available on demand while Send, Buy, and ownership
 * remain visually primary and the atomic Perutah never disappears behind decoration.
 */

/**
 * Creates the closed-by-default coin study surface used by Wallet rendering.
 *
 * @returns {HTMLDetailsElement} Historical currency disclosure.
 */
export function createCoinStudySurface() {
	const details = node("details", "coin-study panel");
	details.id = "coinStudy";
	const summary = node("summary", "coin-study__summary");
	summary.append(
		text("span", "", "Coin system"),
		text("small", "", "Primary-source ratios · open to study")
	);

	const intro = text(
		"p",
		"coin-study__intro",
		"The ledger always stores exact whole Perutahs. Automatic display uses only compatible source-backed ratios; disputed historical exchange rates remain reference-only."
	);
	const balance = studySection(
		"Your exact balance",
		"Automatic denomination decomposition",
		"coinGrid"
	);
	const ladder = studySection(
		"Automatic ladder",
		"Compatible ratios used for display",
		"coinSystem"
	);
	const variants = studySection(
		"Historical variants",
		"Primary-source disagreements that never enter Wallet arithmetic",
		"coinReferences"
	);

	details.append(summary, intro, balance, ladder, variants);
	return details;
}

function studySection(title, description, mountId) {
	const section = node("section", "coin-study__section");
	const mount = node("div", "coin-study__list");
	mount.id = mountId;
	section.append(
		text("h3", "", title),
		text("p", "", description),
		mount
	);
	return section;
}

function node(tagName, className = "") {
	const element = document.createElement(tagName);
	element.className = className;
	return element;
}

function text(tagName, className, value) {
	const element = node(tagName, className);
	element.textContent = value;
	return element;
}

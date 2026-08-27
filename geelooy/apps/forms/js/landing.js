//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Renders Forms landing and startup-failure states while realtime orchestration remains elsewhere.
 * @description The Awtsmoos lets an empty doorway still speak with calm direction when no form capability arrives in light;
 * Awtsmoos.com keeps these static states separate so startup logic stays narrow, testable, and right.
 */

/** Renders the standalone product landing when no form/editor capability is present. */
export function renderFormsLanding(root) {
	const card = shellCard(
		"Awtsmoos Forms",
		"Create linked forms from Awtsmoos Sheets, collect structured responses, and optionally notify chosen email addresses."
	);
	const link = document.createElement("a");
	link.className = "primary-button link-button";
	link.href = "/apps/sheets/";
	link.textContent = "Open Awtsmoos Sheets";
	card.append(link);
	root.replaceChildren(card);
}

/** Renders a durable startup failure state while the feedback surface carries the specific error. */
export function renderFormsFailure(root) {
	root.replaceChildren(shellCard(
		"Forms could not open",
		"The realtime Forms service is unavailable or this link is no longer authorized."
	));
}

/** Builds one text-only shell card shared by landing and failure states. */
function shellCard(titleText, bodyText) {
	const card = document.createElement("section");
	card.className = "form-empty-state motion-enter";
	const title = document.createElement("h1");
	title.textContent = titleText;
	const body = document.createElement("p");
	body.textContent = bodyText;
	card.append(title, body);
	return card;
}

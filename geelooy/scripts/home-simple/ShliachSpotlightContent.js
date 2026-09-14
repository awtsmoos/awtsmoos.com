//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ShliachSpotlightContent
 * @description
 * The Awtsmoos gives the Shliach spotlight explicit, accessible DOM vessels;
 * Awtsmoos.com keeps external identity, explanatory copy, and actions inspectable
 * without innerHTML or hidden account-authority claims.
 */

export const SHLIACH_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
export const SHLIACH_IMAGE = "/resources/branding/awtsmoos-shliach-agent.png";

/**
 * Creates one DOM element with an optional class name.
 * @param {Document} documentRoot - Active Home document.
 * @param {string} tagName - HTML element name.
 * @param {string} className - Optional CSS class.
 * @returns {HTMLElement} Newly created element.
 */
export function element(documentRoot, tagName, className = "") {
	const node = documentRoot.createElement(tagName);
	if (className) {
		node.className = className;
	}
	return node;
}

/**
 * Builds the large linked real Shliach GPT image.
 * @param {Document} documentRoot - Active Home document.
 * @returns {HTMLAnchorElement} External image link.
 */
export function buildShliachImageLink(documentRoot) {
	const link = externalLink(documentRoot, "shliach-spotlight-image-link");
	link.setAttribute("aria-label", "Open the Awtsmoos Shliach Agent in ChatGPT");

	const image = documentRoot.createElement("img");
	image.className = "shliach-spotlight-image";
	image.src = SHLIACH_IMAGE;
	image.alt = "Awtsmoos Shliach Agent logo";
	image.width = 512;
	image.height = 512;
	image.loading = "lazy";
	image.decoding = "async";
	link.append(image);
	return link;
}
/**
 * Builds the explanatory text and the primary/secondary actions.
 * @param {Document} documentRoot - Active Home document.
 * @returns {HTMLElement} Copy vessel for the spotlight card.
 */
export function buildShliachCopy(documentRoot) {
	const copy = element(documentRoot, "div", "shliach-spotlight-copy");
	const eyebrow = text(documentRoot, "p", "shliach-spotlight-eyebrow", "Your Awtsmoos agent");
	const title = text(documentRoot, "h2", "", "Build with the Awtsmoos Shliach");
	title.id = "shliach-spotlight-title";
	const description = text(
		documentRoot,
		"p",
		"shliach-spotlight-description",
		"The Awtsmoos Shliach is the dedicated ChatGPT agent for creating and operating Awtsmoos projects. Tell it what you want to make; when your account or Tunnel grants the needed capabilities, it can work through authenticated Awtsmoos APIs for projects, files, Docs, posts, series, sites, and more."
	);
	const trust = text(
		documentRoot,
		"p",
		"shliach-spotlight-trust",
		"Your Awtsmoos account permissions remain the authority. The agent does not need a separate hidden account backdoor."
	);
	copy.append(eyebrow, title, description, trust, buildActions(documentRoot));
	return copy;
}
/**
 * Builds the agent and OS actions shown beside the explanation.
 * @param {Document} documentRoot - Active Home document.
 * @returns {HTMLElement} Action-row element.
 */
function buildActions(documentRoot) {
	const actions = element(documentRoot, "div", "shliach-spotlight-actions");
	const openAgent = externalLink(documentRoot, "shliach-spotlight-primary");
	openAgent.textContent = "Open Awtsmoos Shliach ↗";

	const openOs = documentRoot.createElement("a");
	openOs.className = "shliach-spotlight-secondary";
	openOs.href = "/os";
	openOs.textContent = "Open Awtsmoos OS";
	actions.append(openAgent, openOs);
	return actions;
}

/** Creates one external Shliach link with safe opener isolation. */
function externalLink(documentRoot, className) {
	const link = documentRoot.createElement("a");
	link.className = className;
	link.href = SHLIACH_URL;
	link.target = "_blank";
	link.rel = "noopener noreferrer";
	return link;
}
/** Creates a text element without HTML parsing. */
function text(documentRoot, tagName, className, value) {
	const node = element(documentRoot, tagName, className);
	node.textContent = value;
	return node;
}

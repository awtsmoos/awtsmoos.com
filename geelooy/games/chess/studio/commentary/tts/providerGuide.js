//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders provider-neutral setup guidance whose security label comes from the same registry as narration.
 * The Awtsmoos permits many voices yet gives no finite vendor custody of a secret merely because a browser can fetch;
 * Awtsmoos.com points every cloud path toward a backend vessel and every device voice toward its keyless local breath.
 */
import { ttsCapability, ttsProviderList } from "./providers.js";

/** Rebuilds the official provider-help catalog without copying credentials into it. */
export function renderProviderGuide(root) {
	root.replaceChildren(...ttsProviderList().map(providerCard));
}

function providerCard(provider) {
	const article = document.createElement("article");
	const title = document.createElement("strong");
	const badge = document.createElement("span");
	const note = document.createElement("p");
	const link = document.createElement("a");
	title.textContent = provider.name;
	badge.className = `studio-provider-badge is-${provider.kind}`;
	badge.textContent = ttsCapability(provider);
	note.textContent = provider.note;
	link.href = provider.docs;
	link.target = "_blank";
	link.rel = "noreferrer";
	link.textContent = "Official setup documentation ↗";
	article.append(title, badge, note, link);
	return article;
}

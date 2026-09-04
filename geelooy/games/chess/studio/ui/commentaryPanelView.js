//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders commentary moments and TTS security posture without owning narration state.
 * The Awtsmoos lets every sentence point back to its exact ply while every cloud voice remains behind the user's gate;
 * Awtsmoos.com shows which path is device-native and which path needs a backend before a secret can tempt fate.
 */
import { getTtsProvider, ttsCapability, ttsProviderList } from "../commentary/tts/providers.js";
import { renderProviderGuide } from "../commentary/tts/providerGuide.js";

export function initializeCommentaryPanel(refs) {
	const options = ttsProviderList().map(provider => new Option(provider.name, provider.id));
	refs.ttsProvider.replaceChildren(...options);
	renderProviderGuide(refs.ttsGuide);
	updateTtsProviderView(refs);
}

export function updateTtsProviderView(refs) {
	const provider = getTtsProvider(refs.ttsProvider.value);
	refs.ttsDocs.href = provider.docs;
	refs.ttsCapability.textContent = ttsCapability(provider);
	refs.ttsCapability.className = `studio-tts-capability is-${provider.kind}`;
	refs.ttsNote.textContent = provider.note;
	refs.ttsCredentials.hidden = provider.kind === "browser";
	refs.ttsEndpoint.placeholder = "https://your-backend.example/tts";
}

export function renderCommentaryEntries(root, moves = []) {
	root.replaceChildren(...moves.map(commentaryCard));
}

export function syncCommentaryPly(root, ply) {
	for (const card of root.querySelectorAll("[data-commentary-ply]")) {
		const current = Number(card.dataset.commentaryPly) === Number(ply);
		card.classList.toggle("is-current", current);
		if (current) {
			card.setAttribute("aria-current", "true");
			card.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
		} else {
			card.removeAttribute("aria-current");
		}
	}
}

function commentaryCard(entry) {
	const article = document.createElement("article");
	article.dataset.commentaryPly = String(entry.ply);
	const button = document.createElement("button");
	button.type = "button";
	button.dataset.commentaryJump = String(entry.ply);
	button.setAttribute("aria-label", `Jump to ply ${entry.ply}, ${entry.san}`);
	const heading = document.createElement("strong");
	const text = document.createElement("p");
	heading.textContent = entry.title
		? `Ply ${entry.ply} · ${entry.san} · ${entry.title}`
		: `Ply ${entry.ply} · ${entry.san}`;
	text.textContent = entry.commentary;
	button.append(heading, text);
	article.append(button);
	return article;
}

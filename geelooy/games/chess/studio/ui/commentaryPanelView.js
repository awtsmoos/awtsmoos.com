//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders commentary cards and TTS provider guidance without owning speech or chess state.
 * The Awtsmoos lets finite words gather beside their ply while no card becomes the game itself;
 * Awtsmoos.com keeps provider ceremony in one small view vessel so the controller remains light on the shelf.
 */
import { getTtsProvider, ttsProviderList } from "../commentary/tts/providers.js";

export function fillTtsProviders(refs) {
	const options = ttsProviderList().map(provider => new Option(provider.name, provider.id));
	refs.ttsProvider.replaceChildren(...options);
	updateTtsProviderView(refs);
}

export function updateTtsProviderView(refs) {
	const provider = getTtsProvider(refs.ttsProvider.value);
	refs.ttsDocs.href = provider.docs;
	refs.ttsNote.textContent = provider.note;
	refs.ttsCredentials.hidden = provider.id === "browser";
}

export function renderCommentaryEntries(root, moves = []) {
	root.replaceChildren(...moves.map(commentaryCard));
}

export function syncCommentaryPly(root, ply) {
	for (const card of root.querySelectorAll("[data-commentary-ply]")) {
		const current = Number(card.dataset.commentaryPly) === Number(ply);
		card.classList.toggle("is-current", current);
		if (current) card.setAttribute("aria-current", "true");
		else card.removeAttribute("aria-current");
	}
}

function commentaryCard(entry) {
	const article = document.createElement("article");
	article.dataset.commentaryPly = String(entry.ply);
	const heading = document.createElement("strong");
	const text = document.createElement("p");
	heading.textContent = `Ply ${entry.ply} · ${entry.san}`;
	text.textContent = entry.commentary;
	article.append(heading, text);
	return article;
}

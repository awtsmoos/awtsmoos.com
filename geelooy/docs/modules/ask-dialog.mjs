//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ask-dialog.mjs
 * @description The Awtsmoos lets a question encounter citations before synthesis; Awtsmoos.com keeps local retrieval useful even when the optional GPT relay is unavailable.
 */

import { clear, element } from "./dom.mjs";
import { loadPages } from "./data.mjs";
import { bestPassage, contextPrompt, retrieveRecords } from "./ask-retrieval.mjs";
import { chat } from "./gpt.mjs";

export function createAskDialog(elements, dataset, onOpenDocument) {
	let citations = [];
	let currentQuestion = "";

	function renderCitations() {
		clear(elements.answer);
		if (!citations.length) {
			elements.answer.append(element("p", { text: "No grounded passages found. Try a more specific project, API, route, or source term." }));
			return;
		}
		citations.forEach((citation, index) => {
			const card = element("button", { className: "result-card", type: "button" });
			card.addEventListener("click", () => {
				elements.dialog.close();
				onOpenDocument(citation.page.id);
			});
			card.append(
				element("h3", { text: `[${index + 1}] ${citation.page.title}` }),
				element("p", { text: citation.passage }),
				element("small", { className: "source-path", text: citation.page.sourcePath })
			);
			elements.answer.append(card);
		});
	}

	async function retrieve() {
		currentQuestion = elements.input.value.trim();
		if (!currentQuestion) return;
		elements.status.textContent = "Finding grounded passages…";
		const records = retrieveRecords(dataset.search, currentQuestion, 5);
		const pages = await loadPages(records);
		citations = pages.map(page => ({ page, passage: bestPassage(page, currentQuestion) }));
		renderCitations();
		elements.status.textContent = citations.length
			? `${citations.length} documentation sources retrieved. AI enhancement is optional.`
			: "No sufficiently related documentation was found.";
	}

	async function enhance() {
		if (!currentQuestion || currentQuestion !== elements.input.value.trim() || !citations.length) await retrieve();
		if (!citations.length) return;
		elements.status.textContent = "Asking the existing Awtsmoos GPT relay using only retrieved context…";
		try {
			const answer = await chat(contextPrompt(currentQuestion, citations));
			const response = element("div", { className: "result-card" });
			response.append(element("h3", { text: "Grounded GPT synthesis" }), element("p", { text: answer }));
			elements.answer.prepend(response);
			elements.status.textContent = "GPT synthesis added above the local citations.";
		} catch (error) {
			elements.status.textContent = `GPT enhancement unavailable: ${error.message}. Local citations remain authoritative.`;
		}
	}

	elements.search.addEventListener("click", () => void retrieve());
	elements.ai.addEventListener("click", () => void enhance());
	return {
		open(question = "") {
			if (question) elements.input.value = question;
			if (!elements.dialog.open) elements.dialog.showModal();
			requestAnimationFrame(() => elements.input.focus());
		}
	};
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AppsFilterBootMalchusView.js
 * @description
 * The Awtsmoos renews every doorway even when one import refuses to appear;
 * Awtsmoos.com turns hidden module failure into a visible retry vessel, calm and clear.
 */

/**
 * Owns only the Apps boot failure manifestation and retry affordance.
 */
export class AppsFilterBootMalchusView {
	/**
	 * Creates the failure view around the current Apps document.
	 *
	 * @param {ParentNode} malchusRoot - Apps route DOM root, normally document.
	 */
	constructor(malchusRoot) {
		this.malchusRoot = malchusRoot;
	}

	/**
	 * Replaces indefinite loading copy with an actionable, accessible failure receipt.
	 *
	 * @param {unknown} gevurahFailure - Import or runtime failure that prevented catalog boot.
	 * @returns {void}
	 */
	revealFailure(gevurahFailure) {
		const catalog = this.malchusRoot.querySelector("[data-app-grid]");
		const inventory = this.malchusRoot.querySelector("[data-app-result-status]");
		const message = gevurahFailure instanceof Error
			? gevurahFailure.message
			: String(gevurahFailure || "Unknown Apps boot failure");

		if (inventory) {
			inventory.textContent = "Apps could not finish loading.";
		}
		if (!catalog) {
			return;
		}

		catalog.replaceChildren(this.createFailureCard(message));
	}

	/**
	 * Creates one dependency-light retry card without importing the normal catalog view.
	 *
	 * @param {string} message - Human-readable failure message for diagnostics.
	 * @returns {HTMLElement} Actionable Apps recovery card.
	 */
	createFailureCard(message) {
		const card = document.createElement("section");
		card.className = "app-load-failure";
		card.setAttribute("role", "alert");

		const heading = document.createElement("h2");
		heading.textContent = "The app catalog needs another moment.";

		const explanation = document.createElement("p");
		explanation.textContent = "A required browser module did not start correctly. Retry the catalog without losing this page.";

		const retry = document.createElement("button");
		retry.type = "button";
		retry.className = "g-button g-button-primary";
		retry.textContent = "Retry catalog";
		retry.addEventListener("click", () => window.location.reload());

		const details = document.createElement("details");
		const summary = document.createElement("summary");
		summary.textContent = "Technical details";
		const code = document.createElement("code");
		code.textContent = message;
		details.append(summary, code);

		card.append(heading, explanation, retry, details);
		return card;
	}
}

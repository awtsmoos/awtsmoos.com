// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos clothes ranked paths as native anchors, letting accessibility, touch, keyboard, and truthful URLs share one visible vessel.

export class OmniboxRenderer {
	constructor(rootElement) {
		this.panelElement = rootElement.querySelector("[data-omnibox-panel]");
		this.optionsElement = rootElement.querySelector("[data-omnibox-options]");
		this.headingElement = rootElement.querySelector("[data-omnibox-heading]");
		this.clearElement = rootElement.querySelector("[data-history-clear]");
		this.statusElement = rootElement.querySelector("[data-omnibox-status]");
	}

	render(actions, activeIndex, options = {}) {
		this.optionsElement.replaceChildren();
		const fragment = document.createDocumentFragment();

		actions.forEach((action, index) => {
			fragment.append(this.createOption(action, index, index === activeIndex));
		});

		this.optionsElement.append(fragment);
		this.headingElement.textContent = options.heading ?? "Suggestions";
		this.clearElement.hidden = !options.hasHistory;
		this.announce(actions.length, options.query ?? "");
	}

	createOption(action, index, isActive) {
		const optionElement = document.createElement("a");
		optionElement.className = "omnibox-option";
		optionElement.href = action.href;
		optionElement.id = `omnibox-option-${index}`;
		optionElement.role = "option";
		optionElement.tabIndex = -1;
		optionElement.dataset.actionIndex = String(index);
		optionElement.dataset.actionKind = action.kind;
		optionElement.dataset.prefetchSafe = String(Boolean(action.canPrefetch));
		optionElement.setAttribute("aria-selected", String(isActive));
		optionElement.classList.toggle("is-active", isActive);

		const symbolElement = document.createElement("span");
		symbolElement.className = "omnibox-symbol";
		symbolElement.textContent = action.symbol;
		symbolElement.setAttribute("aria-hidden", "true");

		const copyElement = document.createElement("span");
		copyElement.className = "omnibox-copy";
		const labelElement = document.createElement("strong");
		labelElement.textContent = action.label;
		const descriptionElement = document.createElement("small");
		descriptionElement.textContent = action.description;
		copyElement.append(labelElement, descriptionElement);

		const badgeElement = document.createElement("span");
		badgeElement.className = "omnibox-badge";
		badgeElement.textContent = action.badge;

		const arrowElement = document.createElement("span");
		arrowElement.className = "omnibox-arrow";
		arrowElement.textContent = "→";
		arrowElement.setAttribute("aria-hidden", "true");

		optionElement.append(symbolElement, copyElement, badgeElement, arrowElement);
		return optionElement;
	}

	setActive(activeIndex) {
		this.getOptions().forEach((optionElement, index) => {
			const isActive = index === activeIndex;
			optionElement.classList.toggle("is-active", isActive);
			optionElement.setAttribute("aria-selected", String(isActive));
		});
	}

	getOption(index) {
		return this.getOptions()[index] ?? null;
	}

	getOptions() {
		return [...this.optionsElement.querySelectorAll("[data-action-index]")];
	}

	getIndexFromTarget(target) {
		if (!(target instanceof Element)) {
			return -1;
		}

		const optionElement = target.closest("[data-action-index]");
		return optionElement ? Number(optionElement.dataset.actionIndex) : -1;
	}

	announce(resultCount, query) {
		const resultLabel = resultCount === 1 ? "result" : "results";
		this.statusElement.textContent = query
			? `${resultCount} ${resultLabel} for ${query}.`
			: `${resultCount} suggested paths.`;
	}
}

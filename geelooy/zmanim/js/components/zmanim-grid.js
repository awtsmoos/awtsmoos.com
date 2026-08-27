//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews eighteen zmanim while a human screen needs four calm gates instead of one endless wall;
 * Awtsmoos.com coordinates disclosure state here, while smaller render vessels build the DOM and every calculation remains one unchanged call.
 */

import { ZMAN_DEFINITIONS, ZMAN_GROUPS } from "../config/zmanim.js";
import { comparisonValues } from "../domain/comparison-values.js";
import { renderMethodNote, renderZmanValues } from "./zman-card-renderer.js";
import { groupHasNext, defaultOpenGroupIds, groupZmanCount } from "./zman-group-policy.js";
import { renderGroupShell, renderGroupToolbar, renderZmanStatus } from "./zman-group-renderer.js";

/** Complete-day coordinator whose disclosure state never enters calculation or URL state. */
export class AwtsmoosZmanimGrid extends HTMLElement {
	constructor() {
		super();
		this.groupOpenState = new Map();
		this.groupStateTouched = false;
		this.boundClick = event => this.handleClick(event);
	}

	set data(value) {
		this.viewData = value;
		this.render();
	}

	connectedCallback() {
		this.addEventListener("click", this.boundClick);
		this.render();
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.boundClick);
	}

	/** Expand or collapse every period as one presentation-only transaction. */
	handleClick(event) {
		const action = event.target.closest("button[data-zman-group-action]")?.dataset.zmanGroupAction;
		if (!action) {
			return;
		}
		this.groupStateTouched = true;
		for (const group of ZMAN_GROUPS) {
			this.groupOpenState.set(group.id, action === "expand");
		}
		this.render();
	}

	/** Rebuild period vessels while retaining explicit reader disclosure state. */
	render() {
		this.replaceChildren();
		if (!this.viewData) {
			return;
		}
		this.ensureDefaultState();
		this.append(renderGroupToolbar());
		for (const group of ZMAN_GROUPS) {
			this.append(this.createGroup(group));
		}
	}

	/** Initialize responsive defaults until the reader deliberately changes a group. */
	ensureDefaultState() {
		if (this.groupStateTouched) {
			return;
		}
		const wide = globalThis.matchMedia?.("(min-width: 721px)").matches ?? true;
		const defaults = new Set(defaultOpenGroupIds(this.viewData, wide));
		for (const group of ZMAN_GROUPS) {
			this.groupOpenState.set(group.id, defaults.has(group.id));
		}
	}

	/** Create one configured period and bind only its local open-state transaction. */
	createGroup(group) {
		const shell = renderGroupShell(
			group,
			this.groupOpenState.get(group.id) ?? false,
			groupZmanCount(group.id),
			groupHasNext(this.viewData, group.id)
		);
		for (const definition of ZMAN_DEFINITIONS.filter(item => item.group === group.id)) {
			shell.body.append(this.createCard(definition));
		}
		shell.details.addEventListener("toggle", () => {
			this.groupStateTouched = true;
			this.groupOpenState.set(group.id, shell.details.open);
		});
		return shell.details;
	}

	/** Create one existing comparison-aware card without altering any calculated value. */
	createCard(definition) {
		const comparison = comparisonValues(this.viewData.calculations, definition.id, this.viewData.primaryOpinionId);
		const card = document.createElement("article");
		card.className = "zman-card";
		const status = comparison.unavailable
			? "unavailable"
			: this.viewData.status?.statusById?.[definition.id] || "selected-date";
		card.dataset.status = status;
		const primary = document.createElement("div");
		primary.className = "zman-primary";
		const label = document.createElement("h4");
		label.textContent = definition.label;
		primary.append(label, renderZmanValues(this.viewData, definition));
		card.append(primary, renderMethodNote(definition, comparison.unavailable));
		if (status === "next" || comparison.unavailable) {
			card.prepend(renderZmanStatus(status === "next" ? "Next" : "Unavailable"));
		}
		return card;
	}
}

customElements.define("awtsmoos-zmanim-grid", AwtsmoosZmanimGrid);

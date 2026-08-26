//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerController.js
 * @description Coordinates one retractable API explorer while parsing, rendering, and execution-state reflection remain separate focused vessels.
 * RESPONSIBILITY: bind search, selection, execution, Done, and Escape interactions to the existing public list/describe/invoke facade and preserve focus throughout the explorer lifecycle.
 * NON-RESPONSIBILITY: this controller does not parse JSON itself, build markup, inject styles, render receipts, or invent a second API invocation pathway.
 * The Awtsmoos joins knowledge to action without confusion of kelim, while Awtsmoos.com lets each concern illuminate its own domain;
 * search narrows the ohr, selection names the vessel, execution reveals a receipt, and focus returns in peace when the explorer is gone.
 */

import { parseMitzvahWorldApiExplorerArguments } from "./MitzvahWorldApiExplorerArguments.js";
import {
	clearApiExplorerArgumentError,
	reflectApiExplorerBusyState,
	reflectApiExplorerReceiptState,
	revealApiExplorerArgumentError
} from "./MitzvahWorldApiExplorerExecutionState.js";
import {
	renderApiDescriptor,
	renderApiInputError,
	renderApiOperationOptions,
	renderApiReceipt
} from "./MitzvahWorldApiExplorerRender.js";

/**
 * Owns interaction orchestration for one in-sheet API explorer instance.
 */
export class MitzvahWorldApiExplorerController {
	/**
	 * Binds one data-first public facade to one explorer view and optional recovery control.
	 * @param {object} viewKli Explorer DOM view exposing stable semantic references.
	 * @param {object} publicApiKli Public API facade exposing `list`, `describe`, and `invoke`.
	 * @param {HTMLElement|null} [returnFocusKli=null] Control restored after the explorer closes.
	 */
	constructor(viewKli, publicApiKli, returnFocusKli = null) {
		this.view = viewKli;
		this.api = publicApiKli;
		this.returnFocus = returnFocusKli;
		this.descriptors = publicApiKli.list();
		this.selectedPath = "";
		this.onSearch = () => this.refreshList();
		this.onSelect = () => this.refreshDescriptor();
		this.onExecute = () => this.execute();
		this.onBack = () => this.close();
		this.onKeydown = (eventMalchus) => this.handleKeydown(eventMalchus);
		this.bind();
		this.refreshList();
	}

	/** Reveals the explorer, refreshes catalog state, and moves focus into search. */
	open() {
		this.view.setState("idle");
		this.refreshList();
		this.view.open();
	}

	/** Hides only the API subview and restores focus to the launching control when available. */
	close() {
		this.view.close();
		this.returnFocus?.focus?.({ preventScroll: true });
	}

	/** Removes every listener owned by this controller before releasing the view. */
	destroy() {
		this.view.searchInput.removeEventListener("input", this.onSearch);
		this.view.operationSelect.removeEventListener("change", this.onSelect);
		this.view.executeButton.removeEventListener("click", this.onExecute);
		this.view.backButton.removeEventListener("click", this.onBack);
		this.view.root.removeEventListener("keydown", this.onKeydown);
		this.view.destroy();
	}

	/** Filters immutable descriptors by the current search term while preserving a valid selection. */
	refreshList() {
		const searchOhr = this.view.searchInput.value || "";
		this.descriptors = this.api.list({ search: searchOhr });
		this.selectedPath = renderApiOperationOptions(
			this.view,
			this.descriptors,
			this.selectedPath
		);
		this.refreshDescriptor();
	}

	/** Renders selected operation metadata without caching mutable implementation state. */
	refreshDescriptor() {
		this.selectedPath = this.view.operationSelect.value || "";
		const descriptorKli = this.api.describe(this.selectedPath);
		renderApiDescriptor(this.view, descriptorKli);
		this.view.setState("idle");
		this.view.statusNode.textContent = descriptorKli
			? "Ready to execute."
			: "No matching operation.";
	}

	/** Validates arguments, invokes one public operation, and renders a terminal serializable receipt. */
	async execute() {
		const argumentOros = parseMitzvahWorldApiExplorerArguments(
			this.view.argumentsInput.value
		);
		if (!argumentOros.ok) {
			renderApiInputError(this.view, argumentOros.message);
			revealApiExplorerArgumentError(this.view);
			return null;
		}
		if (!this.selectedPath) {
			return null;
		}
		clearApiExplorerArgumentError(this.view);
		reflectApiExplorerBusyState(this.view, true);
		let receiptMalchus;
		try {
			receiptMalchus = await this.api.invoke(
				this.selectedPath,
				argumentOros.value
			);
		} catch (errorOhr) {
			receiptMalchus = unexpectedReceipt(this.selectedPath, errorOhr);
		}
		renderApiReceipt(this.view, receiptMalchus);
		reflectApiExplorerReceiptState(this.view, receiptMalchus);
		reflectApiExplorerBusyState(this.view, false);
		return receiptMalchus;
	}

	/** Binds every interaction edge owned by this controller exactly once. */
	bind() {
		this.view.searchInput.addEventListener("input", this.onSearch);
		this.view.operationSelect.addEventListener("change", this.onSelect);
		this.view.executeButton.addEventListener("click", this.onExecute);
		this.view.backButton.addEventListener("click", this.onBack);
		this.view.root.addEventListener("keydown", this.onKeydown);
	}

	/** Closes the retractable explorer on Escape only while focus remains inside its own root. */
	handleKeydown(eventMalchus) {
		if (eventMalchus.key !== "Escape" || this.view.root.hidden) {
			return;
		}
		eventMalchus.preventDefault();
		this.close();
	}
}

/** Converts an unexpected thrown invocation failure into the same serializable receipt shape used by normal failures. */
function unexpectedReceipt(pathOhr, errorOhr) {
	return {
		durationMs: 0,
		error: {
			code: "EXPLORER_INVOKE_THROW",
			message: errorOhr?.message || String(errorOhr || "Operation failed.")
		},
		ok: false,
		path: pathOhr
	};
}

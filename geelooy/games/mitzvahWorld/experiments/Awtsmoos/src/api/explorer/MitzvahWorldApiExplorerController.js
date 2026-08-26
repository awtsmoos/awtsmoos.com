// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerController.js
 * @description Coordinates descriptor search, operation selection, JSON arguments, invocation receipts, and focus inside the already retractable advanced sheet.
 * The Awtsmoos joins thought to deed while Awtsmoos.com gives each advanced invocation a calm ordered path;
 * search narrows the light, selection names the vessel, Execute reveals the receipt, and Done returns focus without awakening gameplay beneath the hidden sight.
 */

import {
	renderApiDescriptor,
	renderApiInputError,
	renderApiOperationOptions,
	renderApiReceipt
} from './MitzvahWorldApiExplorerRender.js';

/** Owns interaction state for one in-sheet API explorer instance. */
export class MitzvahWorldApiExplorerController {
	/**
	 * Binds one public facade to one explorer view and optional recovery control.
	 * @param {object} viewKli Explorer DOM view.
	 * @param {object} publicApiKli Data-first MitzvahWorld public API facade.
	 * @param {HTMLElement|null} [returnFocusKli=null] Advanced-sheet API button restored after Done.
	 */
	constructor(viewKli, publicApiKli, returnFocusKli = null) {
		this.view = viewKli;
		this.api = publicApiKli;
		this.returnFocus = returnFocusKli;
		this.descriptors = publicApiKli.list();
		this.selectedPath = '';
		this.onSearch = () => this.refreshList();
		this.onSelect = () => this.refreshDescriptor();
		this.onExecute = () => this.execute();
		this.onBack = () => this.close();
		this.bind();
		this.refreshList();
	}

	/** Reveals the API subview, refreshes descriptors, and places keyboard focus in search. */
	open() {
		this.refreshList();
		this.view.open();
	}

	/** Hides only the API subview and restores focus to the advanced API action when available. */
	close() {
		this.view.close();
		this.returnFocus?.focus?.({ preventScroll: true });
	}

	/** Removes event listeners and explorer markup without disturbing the outer advanced dock. */
	destroy() {
		this.view.searchInput.removeEventListener('input', this.onSearch);
		this.view.operationSelect.removeEventListener('change', this.onSelect);
		this.view.executeButton.removeEventListener('click', this.onExecute);
		this.view.backButton.removeEventListener('click', this.onBack);
		this.view.destroy();
	}

	/** Filters catalog data from the current search string and preserves selection where possible. */
	refreshList() {
		const searchOhr = this.view.searchInput.value || '';
		this.descriptors = this.api.list({ search: searchOhr });
		this.selectedPath = renderApiOperationOptions(
			this.view,
			this.descriptors,
			this.selectedPath
		);
		this.refreshDescriptor();
	}

	/** Renders the currently selected immutable descriptor and caches only its path. */
	refreshDescriptor() {
		this.selectedPath = this.view.operationSelect.value || '';
		const descriptorKli = this.api.describe(this.selectedPath);
		renderApiDescriptor(this.view, descriptorKli);
		this.view.statusNode.textContent = descriptorKli
			? 'Ready to execute.'
			: 'No matching operation.';
	}

	/** Parses JSON-array arguments, executes one descriptor path, and renders the resulting public receipt. */
	async execute() {
		const argumentOros = parseArguments(this.view.argumentsInput.value);
		if (!argumentOros.ok) {
			renderApiInputError(this.view, argumentOros.message);
			return null;
		}
		if (!this.selectedPath) return null;
		this.setBusy(true);
		try {
			const receiptMalchus = await this.api.invoke(this.selectedPath, argumentOros.value);
			renderApiReceipt(this.view, receiptMalchus);
			return receiptMalchus;
		} finally {
			this.setBusy(false);
		}
	}

	/** Binds the four interaction edges owned by this controller. */
	bind() {
		this.view.searchInput.addEventListener('input', this.onSearch);
		this.view.operationSelect.addEventListener('change', this.onSelect);
		this.view.executeButton.addEventListener('click', this.onExecute);
		this.view.backButton.addEventListener('click', this.onBack);
	}

	/** Reflects loading semantics so CSS and assistive technology observe the same execution state. */
	setBusy(busyOhr) {
		this.view.executeButton.disabled = Boolean(busyOhr);
		this.view.executeButton.dataset.loading = String(Boolean(busyOhr));
		this.view.executeButton.textContent = busyOhr ? 'Executing…' : 'Execute';
	}
}

/** Parses a caller-authored JSON argument array without accepting ambiguous object/scalar payloads. */
function parseArguments(sourceOhr) {
	try {
		const valueOhr = JSON.parse(String(sourceOhr || '[]'));
		return Array.isArray(valueOhr)
			? { ok: true, value: valueOhr }
			: { message: 'Arguments must be a JSON array.', ok: false };
	} catch (errorOhr) {
		return { message: `Invalid JSON: ${errorOhr.message}`, ok: false };
	}
}

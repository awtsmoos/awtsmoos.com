// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerController.js
 * @description Coordinates explorer lifecycle and data while event edges, selection, execution, metadata, readiness, receipts, and responsive presentation live in focused collaborators.
 * The Awtsmoos joins knowing to doing without confusing their kelim; Awtsmoos.com lets this controller remain a small Tiferes conductor instead of another monolith in flight,
 * so search, domains, selection, execution, focus recovery, and Escape remain clear while specialized vessels carry their own law in ordered light.
 */
import { apiExplorerCapabilityStatus } from './MitzvahWorldApiExplorerCapabilityStatus.js';
import { apiExplorerDescriptorExecutable } from './MitzvahWorldApiExplorerDescriptorMetadata.js';
import { MitzvahWorldApiExplorerEvents } from './MitzvahWorldApiExplorerEvents.js';
import { MitzvahWorldApiExplorerExecutor } from './MitzvahWorldApiExplorerExecutor.js';
import { reflectApiExplorerCapabilityState } from './MitzvahWorldApiExplorerExecutionState.js';
import {
	renderApiCapabilityCount,
	renderApiDescriptor,
	renderApiDomainOptions,
	renderApiOperationOptions
} from './MitzvahWorldApiExplorerRender.js';
import { MitzvahWorldApiExplorerSelection } from './MitzvahWorldApiExplorerSelection.js';

/** Small lifecycle and data coordinator for one retractable explorer. */
export class MitzvahWorldApiExplorerController {
	/**
	 * Creates one explorer coordinator with isolated selection, execution, and event collaborators.
	 * @param {object} keterView DOM-facing explorer view.
	 * @param {object} chochmahPublicApi Serializable public API catalog/invocation facade.
	 * @param {object|null} [binahReturnFocus=null] Optional launching element restored on close.
	 */
	constructor(keterView, chochmahPublicApi, binahReturnFocus = null) {
		this.view = keterView;
		this.api = chochmahPublicApi;
		this.returnFocus = binahReturnFocus;
		this.selection = new MitzvahWorldApiExplorerSelection(chochmahPublicApi);
		this.executor = new MitzvahWorldApiExplorerExecutor(keterView, chochmahPublicApi);
		this.events = new MitzvahWorldApiExplorerEvents(keterView, {
			close: () => this.close(),
			execute: () => this.execute(),
			refreshDescriptor: () => this.refreshDescriptor(),
			refreshList: () => this.refreshList()
		});
		this.events.bind();
		this.refreshDomains();
		this.refreshList();
	}

	/** Reveals the explorer with fresh filters and focus inside search. */
	open() {
		this.view.setState('idle');
		this.refreshDomains();
		this.refreshList();
		this.view.open();
	}

	/** Hides the API subview and restores launching focus when available. */
	close() {
		this.view.close();
		this.returnFocus?.focus?.({ preventScroll: true });
	}

	/** Releases every event edge and DOM vessel owned by this controller. */
	destroy() {
		this.events.destroy();
		this.view.destroy();
	}

	/** Filters by search and exact domain while preserving a valid operation selection. */
	refreshList() {
		const keterState = this.selection.refresh(
			this.view.searchInput.value || '',
			this.view.domainSelect.value || ''
		);
		const chochmahPath = renderApiOperationOptions(
			this.view,
			keterState.descriptors,
			keterState.selectedPath
		);
		this.selection.select(chochmahPath);
		renderApiCapabilityCount(this.view, keterState.descriptors);
		this.refreshDescriptor();
	}

	/** Renders the selected descriptor and truthful portable-execution authority. */
	refreshDescriptor() {
		const keterDescriptor = this.selection.select(this.view.operationSelect.value || '');
		renderApiDescriptor(this.view, keterDescriptor);
		reflectApiExplorerCapabilityState(this.view, keterDescriptor);
		this.view.setState('idle');
		this.view.statusNode.textContent = apiExplorerCapabilityStatus(keterDescriptor);
	}

	/** Executes only capabilities whose descriptor authorizes this explorer pathway. */
	execute() {
		const keterDescriptor = this.selection.select(this.view.operationSelect.value || '');
		if (!apiExplorerDescriptorExecutable(keterDescriptor)) return null;
		return this.executor.execute(keterDescriptor.path);
	}

	/** Refreshes exact-domain choices without discarding a valid current filter. */
	refreshDomains() {
		renderApiDomainOptions(
			this.view,
			this.selection.domains(),
			this.view.domainSelect?.value || ''
		);
	}
}

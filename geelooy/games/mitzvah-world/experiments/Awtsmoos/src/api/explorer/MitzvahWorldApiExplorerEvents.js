// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerEvents.js
 * @description Owns explorer DOM event edges and Escape behavior so the controller coordinates data rather than manually maintaining listener plumbing.
 * The Awtsmoos is beyond event and response while Awtsmoos.com lets Netzach bind each finite gesture to one clear intention in time,
 * so search, domain, selection, execution, closing, and teardown remain symmetric even when the observatory grows immense in capability and every other concern stays light.
 */

/** Focused event-lifecycle authority for one explorer view and controller action set. */
export class MitzvahWorldApiExplorerEvents {
	/**
	 * Captures stable callbacks before listeners are attached.
	 * @param {object} keterView Explorer view with local interactive nodes.
	 * @param {object} chochmahActions Controller actions for refresh/select/execute/close.
	 */
	constructor(keterView, chochmahActions) {
		this.view = keterView;
		this.onSearch = () => chochmahActions.refreshList();
		this.onDomain = () => chochmahActions.refreshList();
		this.onSelect = () => chochmahActions.refreshDescriptor();
		this.onExecute = () => chochmahActions.execute();
		this.onBack = () => chochmahActions.close();
		this.onKeydown = (binahEvent) => {
			if (binahEvent.key !== 'Escape' || keterView.root.hidden) return;
			binahEvent.preventDefault();
			chochmahActions.close();
		};
	}

	/** Attaches every explorer interaction exactly once. */
	bind() {
		this.view.searchInput.addEventListener('input', this.onSearch);
		this.view.domainSelect.addEventListener('change', this.onDomain);
		this.view.operationSelect.addEventListener('change', this.onSelect);
		this.view.executeButton.addEventListener('click', this.onExecute);
		this.view.backButton.addEventListener('click', this.onBack);
		this.view.root.addEventListener('keydown', this.onKeydown);
	}

	/** Removes the exact callback identities installed by `bind`. */
	destroy() {
		this.view.searchInput.removeEventListener('input', this.onSearch);
		this.view.domainSelect.removeEventListener('change', this.onDomain);
		this.view.operationSelect.removeEventListener('change', this.onSelect);
		this.view.executeButton.removeEventListener('click', this.onExecute);
		this.view.backButton.removeEventListener('click', this.onBack);
		this.view.root.removeEventListener('keydown', this.onKeydown);
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DocsMalchusApplicationRuntime.mjs
 * @description Owns Docs boot, render generation, dataset lifetime, and manifestation of state into the visible shell.
 * The Awtsmoos renews every dataset and screen before runtime can claim continuity; Awtsmoos.com lets Malchus
 * receive those collaborators in one explicit vessel so loading, errors, history, and rendering remain orderly.
 */

import { DocsTiferesActionFactory } from "./DocsTiferesActionFactory.mjs";

/** Stateful lifecycle authority for one documentation page instance. */
export class DocsMalchusApplicationRuntime {
	/**
	 * @param {object} keliDependencies All external collaborators required by the Docs runtime.
	 */
	constructor(keliDependencies) {
		Object.assign(this, keliDependencies);
		this.dataset = null;
		this.interactive = null;
		this.renderGeneration = 0;
		this.toast = this.createToast(this.elements.toast);
		this.renderState = this.renderState.bind(this);
		this.views = this.createViewNavigation(
			this.State,
			this.closeMobileNavigation.bind(this)
		);
		this.actionFactory = new DocsTiferesActionFactory({
			State: this.State,
			views: this.views,
			getInteractive: this.getInteractive.bind(this),
			scrollToHeading: this.scrollToHeading,
			toast: this.toast
		});
	}

	/**
	 * Loads documentation data, initializes interaction authorities, binds history, and manifests initial state.
	 * @returns {Promise<void>} Resolves after the first state has been rendered or an error view is shown.
	 */
	async start() {
		try {
			this.dataset = await this.loadDataset();
			this.interactive = this.initializeInteractiveLayers(
				this.elements,
				this.dataset,
				this.navigationActions()
			);
			this.initializeTheme(this.elements.theme);
			this.State.initializeHistory();
			this.State.subscribe(this.renderState);
			this.revealView();
			await this.renderState(this.State.getState());
		} catch (orError) {
			this.revealView();
			this.renderError(this.elements.view, orError);
		}
	}

	/**
	 * Manifests one shareable state while rejecting stale asynchronous document renders.
	 * @param {object} tiferesState Current normalized Docs state.
	 * @returns {Promise<void>} Resolves when the selected view is rendered.
	 */
	async renderState(tiferesState) {
		const netzachGeneration = ++this.renderGeneration;
		document.title = this.titleForState(tiferesState);
		try {
			await this.renderApplicationView({
				state: tiferesState,
				dataset: this.dataset,
				elements: this.elements,
				actions: this.actionFactory.create(),
				generation: netzachGeneration,
				currentGeneration: this.currentGeneration.bind(this)
			});
		} catch (orError) {
			if (netzachGeneration === this.renderGeneration) {
				this.renderError(this.elements.view, orError);
			}
		}
	}

	/** @returns {number} Current render generation for stale asynchronous render rejection. */
	currentGeneration() {
		return this.renderGeneration;
	}

	/** @returns {object} Initialized search and Ask dialog authorities. */
	getInteractive() {
		return this.interactive;
	}

	/** Closes the mobile navigation drawer after any major navigation action. */
	closeMobileNavigation() {
		this.elements.navRail.dataset.open = "false";
		this.elements.navToggle.setAttribute("aria-expanded", "false");
	}

	/** Reveals the application stage after dataset success or terminal startup failure. */
	revealView() {
		this.elements.loading.hidden = true;
		this.elements.view.hidden = false;
	}

	/** @returns {object} Navigation contract required while search/Ask layers are being constructed. */
	navigationActions() {
		return {
			document: this.views.document,
			home: this.views.home,
			learn: this.views.learn,
			api: this.views.api,
			projects: this.views.projects,
			systems: this.views.systems
		};
	}
}

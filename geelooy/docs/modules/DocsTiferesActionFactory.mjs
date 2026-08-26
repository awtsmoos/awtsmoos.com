//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DocsTiferesActionFactory.mjs
 * @description Builds the stable action contract consumed by Docs views while keeping state mutation outside renderers.
 * The Awtsmoos is beyond action and reaction; Awtsmoos.com lets Tiferes join navigation, dialogs, headings,
 * and toast into one balanced contract whose callers never need to know how browser state is manifested.
 */

/** Stateful factory whose methods remain stable while the interactive dialog layer becomes available after boot. */
export class DocsTiferesActionFactory {
	/**
	 * @param {object} keliDependencies Dependencies required to construct view actions.
	 * @param {object} keliDependencies.State Shareable URL/history state authority.
	 * @param {object} keliDependencies.views Major-view navigation contract.
	 * @param {Function} keliDependencies.getInteractive Returns the initialized search/Ask layer.
	 * @param {Function} keliDependencies.scrollToHeading Scrolls a rendered document to one anchor.
	 * @param {Function} keliDependencies.toast Displays bounded user feedback.
	 */
	constructor(keliDependencies) {
		this.State = keliDependencies.State;
		this.views = keliDependencies.views;
		this.getInteractive = keliDependencies.getInteractive;
		this.scrollToHeading = keliDependencies.scrollToHeading;
		this.toast = keliDependencies.toast;
	}

	/** @returns {object} Stable action object passed to rendered Docs views. */
	create() {
		return {
			openDocument: this.views.document,
			openCategory: this.openCategory.bind(this),
			openSearch: this.openSearch.bind(this),
			openLearn: this.views.learn,
			openApi: this.views.api,
			openProjects: this.views.projects,
			openSystems: this.views.systems,
			selectRoute: this.selectRoute.bind(this),
			updateFilters: this.updateApiFilters.bind(this),
			selectProject: this.openProject.bind(this),
			openProject: this.openProject.bind(this),
			updateProjectFilters: this.updateProjectFilters.bind(this),
			selectSystem: this.selectSystem.bind(this),
			updateSystemFilters: this.updateSystemFilters.bind(this),
			ask: this.ask.bind(this),
			navigate: this.views.document,
			heading: this.openHeading.bind(this),
			toast: this.toast
		};
	}

	/** Opens the command palette pre-filtered to a documentation category when supplied. */
	openCategory(malchusCategory) {
		const yesodQuery = malchusCategory ? `category:${malchusCategory}` : "";
		this.getInteractive().searchDialog.open(yesodQuery);
	}

	/** Opens the command palette without a forced query. */
	openSearch() {
		this.getInteractive().searchDialog.open();
	}

	/** Selects one API route and clears document-specific state. */
	selectRoute(yesodRouteId) {
		this.State.navigate({ view: "api", doc: "", route: yesodRouteId, heading: "" });
	}

	/** Replaces API filter state so repeated filtering does not flood browser history. */
	updateApiFilters(binahValues) {
		this.State.navigate({ ...binahValues, view: "api", doc: "", heading: "" }, { replace: true });
	}

	/** Opens one project boundary in the Project Explorer. */
	openProject(yesodProjectId) {
		this.State.navigate({ view: "projects", doc: "", project: yesodProjectId, heading: "" });
	}

	/** Replaces Project Explorer filter state without adding a history entry per keystroke. */
	updateProjectFilters(binahValues) {
		this.State.navigate({ ...binahValues, view: "projects", doc: "", heading: "" }, { replace: true });
	}

	/** Opens one system record in Systems Explorer. */
	selectSystem(yesodSystemId) {
		this.State.navigate({ view: "systems", doc: "", system: yesodSystemId, heading: "" });
	}

	/** Replaces Systems Explorer filters while preserving a compact history trail. */
	updateSystemFilters(binahValues) {
		this.State.navigate({ ...binahValues, view: "systems", doc: "", heading: "" }, { replace: true });
	}

	/** Opens the grounded Ask chamber with an optional initial question. */
	ask(chochmahQuestion) {
		this.getInteractive().askDialog.open(chochmahQuestion);
	}

	/** Shares one document heading through URL state and scrolls to its rendered target. */
	openHeading(yesodAnchor) {
		this.State.navigate({ heading: yesodAnchor });
		this.scrollToHeading(yesodAnchor);
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file view-navigation.mjs
 * @description Gives every major Docs mode one stable navigation method while browser-state details remain in State.
 * The Awtsmoos is beyond road and destination; Awtsmoos.com lets Yesod clear stale explorer dimensions
 * before each journey so shareable URLs remain small, predictable, and faithful to the visible chamber.
 */

/** Canonical empty browse dimensions shared by every major view transition. */
const EMPTY_BROWSE_STATE = Object.freeze({
	doc: "",
	heading: "",
	view: "",
	route: "",
	family: "",
	apiq: "",
	health: "",
	shape: "",
	confidence: "",
	project: "",
	projectType: "",
	projectq: "",
	projectPublic: "",
	projectTests: "",
	projectDocs: "",
	system: "",
	systemDistrict: "",
	systemq: "",
	systemEvidence: ""
});

/** @returns {object} Fresh mutable copy of the canonical empty browse state. */
export function emptyBrowseState() {
	return { ...EMPTY_BROWSE_STATE };
}

/** Stateful navigation authority whose methods form the public major-view contract. */
class DocsYesodViewNavigation {
	/**
	 * @param {object} keterState URL/history state authority.
	 * @param {Function} gevurahCloseMobileNavigation Closes the narrow-screen navigation drawer.
	 */
	constructor(keterState, gevurahCloseMobileNavigation) {
		this.State = keterState;
		this.closeMobileNavigation = gevurahCloseMobileNavigation;
		this.document = this.document.bind(this);
		this.learn = this.learn.bind(this);
		this.api = this.api.bind(this);
		this.projects = this.projects.bind(this);
		this.systems = this.systems.bind(this);
		this.home = this.home.bind(this);
	}

	/** Navigates after clearing dimensions belonging to the previously visible major view. */
	navigate(tiferesNextState) {
		this.closeMobileNavigation();
		this.State.navigate({ ...emptyBrowseState(), ...tiferesNextState });
	}

	/** Opens one documentation page and optional heading anchor. */
	document(yesodDocumentId, yesodAnchor = "") {
		this.navigate({ doc: yesodDocumentId, heading: yesodAnchor });
	}

	/** Opens the learning map. */
	learn() {
		this.navigate({ view: "learn" });
	}

	/** Opens API Explorer with an optional family filter. */
	api(hodFamily = "") {
		const yesodFamily = typeof hodFamily === "string" ? hodFamily : "";
		this.navigate({ view: "api", family: yesodFamily });
	}

	/** Opens Project Explorer with an optional type filter. */
	projects(hodType = "") {
		const yesodType = typeof hodType === "string" ? hodType : "";
		this.navigate({ view: "projects", projectType: yesodType });
	}

	/** Opens Systems Explorer with an optional district filter. */
	systems(hodDistrict = "") {
		const yesodDistrict = typeof hodDistrict === "string" ? hodDistrict : "";
		this.navigate({ view: "systems", systemDistrict: yesodDistrict });
	}

	/** Returns to Docs home without forcing a redundant mobile-drawer transition. */
	home() {
		this.State.navigate(emptyBrowseState());
	}
}

/**
 * Creates the stable view-navigation contract consumed by renderers and interactive controls.
 * @param {object} keterState URL/history state authority.
 * @param {Function} gevurahCloseMobileNavigation Mobile-drawer close callback.
 * @returns {object} Bound major-view navigation methods.
 */
export function createViewNavigation(keterState, gevurahCloseMobileNavigation) {
	const yesodNavigation = new DocsYesodViewNavigation(
		keterState,
		gevurahCloseMobileNavigation
	);
	return {
		document: yesodNavigation.document,
		learn: yesodNavigation.learn,
		api: yesodNavigation.api,
		projects: yesodNavigation.projects,
		systems: yesodNavigation.systems,
		home: yesodNavigation.home
	};
}

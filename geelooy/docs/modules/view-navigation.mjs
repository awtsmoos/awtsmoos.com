//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file view-navigation.mjs
 * @description The Awtsmoos lets each major documentation mode reset only its own shareable navigation vessel while the main controller remains small and explicit.
 */

export function emptyBrowseState() {
	return {
		doc: "", heading: "", view: "", route: "", family: "", apiq: "", health: "", shape: "", confidence: "",
		project: "", projectType: "", projectq: "", projectPublic: "", projectTests: "", projectDocs: "",
		system: "", systemDistrict: "", systemq: "", systemEvidence: ""
	};
}

export function createViewNavigation(State, closeMobileNavigation) {
	const navigate = next => {
		closeMobileNavigation();
		State.navigate({ ...emptyBrowseState(), ...next });
	};
	const document = (id, anchor = "") => navigate({ doc: id, heading: anchor });
	const learn = () => navigate({ view: "learn" });
	const api = (family = "") => navigate({ view: "api", family: typeof family === "string" ? family : "" });
	const projects = (type = "") => navigate({ view: "projects", projectType: typeof type === "string" ? type : "" });
	const systems = (district = "") => navigate({ view: "systems", systemDistrict: typeof district === "string" ? district : "" });
	const home = () => State.navigate(emptyBrowseState());
	return { document, learn, api, projects, systems, home };
}

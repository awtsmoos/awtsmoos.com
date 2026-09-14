//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataEngineBadge
 * @description
 * Displays server-proven database-engine capabilities without exposing database paths,
 * secrets, or assuming that a DosDB-compatible project has native AwtsmoosDB indexes.
 */

import { createElement } from "./dom.js";

/**
 * Creates a cached capability badge that refreshes only when project identity changes.
 * @param {{fields:object,platformProvider:Function}} options Studio dependencies.
 * @returns {{element:HTMLElement,refresh:Function}} Engine evidence controller.
 */
export function createProjectDataEngineBadge(options) {
	const title = createElement("strong", { text: "Database engine" });
	const mode = createElement("span", { text: "Connect a canonical project" });
	const features = createElement("div", { className: "project-engine-features" });
	const element = createElement("aside", {
		className: "project-engine-badge",
		children: [title, mode, features]
	});
	let lastIdentity = "";
	return { element, refresh };

	async function refresh() {
		const alias = options.fields.alias.value;
		const project = options.fields.project.value;
		const identity = `${alias}\u0000${project}`;
		if (!alias || !project) {
			lastIdentity = "";
			mode.textContent = "Connect a canonical project";
			features.replaceChildren();
			options.onEvidence?.(null);
			return;
		}
		if (identity === lastIdentity) return;
		lastIdentity = identity;
		mode.textContent = "Inspecting runtime…";
		try {
			const platform = options.platformProvider();
			if (!platform?.project) throw new Error("Project API unavailable");
			const result = await platform.project(alias, project).databaseCapabilities();
			render(result.database || {});
		} catch (error) {
			lastIdentity = "";
			mode.textContent = error?.message || "Engine evidence unavailable";
			features.replaceChildren();
			options.onEvidence?.(null);
		}
	}

	function render(database) {
		mode.textContent = `${database.engine || "DosDB-compatible"} · ${modeLabel(database.mode)}`;
		const enabled = Object.entries(database.features || {}).filter(([, value]) => value).map(([name]) => name);
		options.onEvidence?.(database);
		features.replaceChildren(...enabled.map(name => createElement("span", {
			className: "project-engine-feature",
			text: name
		})));
		if (!enabled.length) features.append(createElement("span", {
			className: "project-engine-feature project-engine-compat",
			text: "bounded project API"
		}));
	}
}

/** @param {string} mode Engine mode. @returns {string} Human-safe mode label. */
function modeLabel(mode) {
	return mode === "native-awtsmoosdb" ? "native AwtsmoosDB" : "DosDB compatibility";
}

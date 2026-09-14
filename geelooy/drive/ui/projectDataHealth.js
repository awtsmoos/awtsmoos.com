//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataHealth
 * @description Renders secret-free Database Studio health and bounded-operation evidence from actual server responses.
 */

import { createElement } from "./dom.js";

/** @returns {{element:HTMLElement,setEngine:Function,setLoad:Function}} Health evidence controller. */
export function createProjectDataHealth() {
	const engine = evidenceCard("Engine", "Awaiting project identity");
	const namespace = evidenceCard("Isolation", "Owner + project namespace");
	const collection = evidenceCard("Collection", "No collection loaded");
	const query = evidenceCard("Query", "Bounded compatibility scan");
	const storage = evidenceCard("Storage listing", "Awaiting collection evidence");
	const preview = evidenceCard("Preview ceiling", "100 documents · 1 MiB response");
	const imports = evidenceCard("Import ceiling", "50 documents · 512 KiB · compensating rollback");
	const features = createElement("div", { className: "project-health-features" });
	const element = createElement("section", {
		className: "project-data-health",
		children: [
			createElement("p", { className: "project-data-health-note", text: "Health shows server-proven capability and bounded Studio behavior; it never exposes database files, roots, or credentials." }),
			createElement("div", { className: "project-health-grid", children: [engine.element, namespace.element, collection.element, query.element, storage.element, preview.element, imports.element] }),
			features
		]
	});
	return { element, setEngine, setLoad };

	function setEngine(evidence = null) {
		engine.set(evidence ? `${evidence.engine || "DosDB-compatible"} · ${evidence.mode || "compatibility"}` : "Awaiting project identity");
		const enabled = Object.entries(evidence?.features || {}).filter(([, value]) => value).map(([name]) => name);
		features.replaceChildren(...enabled.map(name => createElement("span", { className: "project-engine-feature", text: name })));
	}

	function setLoad(evidence = {}) {
		const returned = evidence.returned ?? evidence.documents?.length ?? 0;
		const total = evidence.total ?? returned;
		collection.set(`${returned} loaded · ${total} source${evidence.truncated ? " · truncated" : ""}`);
		query.set(evidence.execution || "bounded compatibility scan");
		storage.set(evidence.storageBounded === true
			? "Disk-bounded metadata reader"
			: "Compatibility fallback · response bounded");
	}
}

/** @param {string} label Evidence label. @param {string} value Initial value. @returns {{element:HTMLElement,set:Function}} Card vessel. */
function evidenceCard(label, value) {
	const text = createElement("strong", { text: value });
	const element = createElement("div", {
		className: "project-health-card",
		children: [createElement("span", { text: label }), text]
	});
	return { element, set(next) { text.textContent = String(next); } };
}

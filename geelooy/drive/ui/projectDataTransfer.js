//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataTransfer
 * @description Provides bounded preview export and rollback-protected JSON import controls for Database Studio.
 */

import { actionButton, createElement } from "./dom.js";
import { createProjectDataExport, importDocumentsFromPayload, projectDataExportName } from "./projectDataTransferModel.js";

const MAX_IMPORT_FILE_BYTES = 655360;

/**
 * @param {{fields:object,platformProvider:Function,getDocuments:Function,refresh:Function,setStatus:Function}} options Transfer dependencies.
 * @returns {HTMLElement} Import/export action group.
 */
export function createProjectDataTransfer(options) {
	const file = createElement("input", {
		className: "project-data-file-input",
		attributes: { type: "file", accept: ".json,application/json", hidden: true }
	});
	file.addEventListener("change", () => void importFile(file.files?.[0], options, file));
	return createElement("div", {
		className: "project-data-actions project-data-transfer",
		children: [
			actionButton("Export loaded preview", () => exportPreview(options)),
			actionButton("Import JSON", () => file.click()),
			file
		]
	});
}

/** @param {object} options Transfer dependencies. */
function exportPreview(options) {
	const documents = options.getDocuments();
	if (!documents.length) return options.setStatus("Load documents before exporting a preview.", "error");
	const identity = identityFrom(options.fields);
	const payload = createProjectDataExport(documents, identity);
	const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
	const href = URL.createObjectURL(blob);
	const anchor = createElement("a", { attributes: { href, download: projectDataExportName(identity.project, identity.path) } });
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(href);
	options.setStatus(`Exported ${documents.length} loaded document(s). This is a preview export, not a backup.`, "success");
}

/** @param {File|undefined} file Selected file. @param {object} options Transfer dependencies. @param {HTMLInputElement} input File input. */
async function importFile(file, options, input) {
	try {
		if (!file) return;
		if (file.size > MAX_IMPORT_FILE_BYTES) throw new Error("Import file exceeds the bounded Studio upload size.");
		const documents = importDocumentsFromPayload(JSON.parse(await file.text()));
		const identity = identityFrom(options.fields);
		options.setStatus(`Importing ${documents.length} validated document(s)…`, "");
		const platform = options.platformProvider();
		if (!platform?.project) throw new Error("Project API unavailable.");
		const result = await platform.project(required(identity.alias, "Alias"), required(identity.project, "Project"))
			.importDocuments(documents, identity.path);
		options.setStatus(`Imported ${result.database?.imported ?? documents.length} document(s).`, "success");
		await options.refresh();
	} catch (error) {
		options.setStatus(error?.message || "Import failed.", "error");
	} finally {
		input.value = "";
	}
}

/** @param {object} fields Studio fields. @returns {object} Current identity. */
function identityFrom(fields) {
	return { alias: fields.alias.value, project: fields.project.value, path: fields.path.value };
}

/** @param {string} value Required value. @param {string} label Human label. @returns {string} Value. */
function required(value, label) {
	if (!value) throw new TypeError(`${label} is required.`);
	return value;
}

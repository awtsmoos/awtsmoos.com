//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDataStudio
 * @description
 * Presents the project-scoped DosDB/AwtsmoosDB API as a visual database console with
 * document browsing, JSON editing, schema inference, table preview, and copyable API.
 */

import { createElement } from "./dom.js";
import { copyStudioApi, createStudioHeader, createStudioJsonEditor } from "./projectDataStudioChrome.js";
import { createProjectDataTransfer } from "./projectDataTransfer.js";
import { createProjectDataStudioController } from "./projectDataStudioController.js";
import { createProjectDataQueryBuilder } from "./projectDataQueryBuilder.js";
import { createProjectDataStudioFields } from "./projectDataStudioFields.js";
import { createProjectDataEngineBadge } from "./projectDataEngineBadge.js";
import { createProjectDataHealth } from "./projectDataHealth.js";
import { createProjectDataPager } from "./projectDataPager.js";
import { studioApiSnippet } from "./projectDataStudioModel.js";
import { renderStudioApi, renderStudioDocuments, renderStudioSchema, renderStudioTable } from "./projectDataStudioRender.js";
import { ensureProjectDataStudioTheme } from "./projectDataStudioTheme.js";
import { createStudioPanels, createStudioToolbar, createStudioWorkspace, setStudioIdentity, setStudioStatus, studioIdentity } from "./projectDataStudioShell.js";

/** @param {Function} platformProvider Stable platform API provider. @returns {HTMLElement} Database Studio surface. */
export function createProjectDataStudio(platformProvider = () => globalThis.GeelooyPlatform) {
	ensureProjectDataStudioTheme();
	const fields = createProjectDataStudioFields();
	const health = createProjectDataHealth();
	const engine = createProjectDataEngineBadge({ fields, platformProvider, onEvidence: health.setEngine });
	const editor = createStudioJsonEditor();
	const documents = createElement("div", { className: "project-data-documents" });
	const table = createElement("div", { className: "project-data-table-wrap" });
	const schema = createElement("div", { className: "project-data-schema" });
	const api = createElement("pre", { className: "project-data-api" });
	const status = createElement("p", { className: "project-data-status", attributes: { "aria-live": "polite" } });
	const meta = createElement("span", { className: "project-data-meta", text: "No collection loaded" });
	let loaded = [];
	const controller = createProjectDataStudioController({
		fields,
		editor,
		platformProvider,
		renderDocuments: (items, evidence) => renderLoaded(items, evidence),
		selectDocument: item => selectLoaded(item),
		setStatus: (message, tone) => setStudioStatus(status, message, tone)
	});
	const panels = createStudioPanels({ document: editor, table, schema, health: health.element, api });
	const queryBuilder = createProjectDataQueryBuilder({
		fields,
		platformProvider,
		onResults: (items, evidence) => renderLoaded(items, evidence),
		setStatus: (message, tone) => setStudioStatus(status, message, tone)
	});
	let pageMode = "collection";
	const pager = createProjectDataPager({
		onNavigate: offset => pageMode === "query" ? queryBuilder.runAtOffset(offset) : controller.listDocuments(offset)
	});
	const transfer = createProjectDataTransfer({
		fields,
		platformProvider,
		getDocuments: () => loaded,
		refresh: controller.listDocuments,
		setStatus: (message, tone) => setStudioStatus(status, message, tone)
	});
	const section = createElement("section", {
		className: "project-data-studio project-database-studio",
		attributes: { id: "awtsmoos-database-studio" }
	});
	section.append(createStudioHeader(meta, engine.element), fields.grid, queryBuilder, createStudioToolbar({
		controller,
		fields,
		editor,
		onCopy: () => copyStudioApi(fields, status)
	}), transfer, pager.element, fields.search.label, createStudioWorkspace(documents, panels), status);
	fields.search.input.addEventListener("input", () => renderExplorer());
	fields.alias.input.addEventListener("change", () => void engine.refresh());
	fields.project.input.addEventListener("change", () => void engine.refresh());
	fields.path.input.addEventListener("change", () => pager.setEvidence({}));
	section.setIdentity = identity => {
		setStudioIdentity(fields, identity);
		void engine.refresh();
	};
	renderStudioApi(api, studioApiSnippet(studioIdentity(fields)));
	return section;

	function renderLoaded(items, evidence) {
		loaded = items;
		pageMode = evidence.query ? "query" : "collection";
		pager.setEvidence(evidence);
		meta.textContent = evidence.matched === undefined
			? `${evidence.returned ?? items.length} loaded · ${evidence.total ?? items.length} total`
			: `${evidence.matched} matched · ${evidence.total ?? items.length} source · ${evidence.execution || "bounded"}`;
		renderExplorer();
		renderStudioTable(table, loaded, controller.chooseDocument);
		renderStudioSchema(schema, loaded);
		health.setLoad(evidence);
		renderStudioApi(api, studioApiSnippet(studioIdentity(fields)));
	}

	function renderExplorer() {
		renderStudioDocuments(documents, loaded, fields.search.value, controller.chooseDocument);
	}

	function selectLoaded(item) {
		if (!item) return;
		panels.show("document");
		renderStudioApi(api, studioApiSnippet(studioIdentity(fields)));
	}
}

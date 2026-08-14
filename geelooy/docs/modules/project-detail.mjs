//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-detail.mjs
 * @description The Awtsmoos lets a selected project unfold into human teaching, generated evidence, source paths, dependencies, entries, and grounded questions.
 */

import { append, badge, clear, copyText, element, formatNumber } from "./dom.mjs";
import { projectEvidenceView } from "./project-evidence-view.mjs";

function button(label, handler, primary = false) {
	const node = element("button", {
		className: primary ? "primary-button" : "secondary-button",
		type: "button",
		text: label
	});
	node.addEventListener("click", handler);
	return node;
}

function documentActions(project, dataset, actions) {
	const wrap = element("div", { className: "project-detail-actions" });
	const manualId = dataset.sourceToId.get(project.humanManual);
	const tutorialId = dataset.sourceToId.get(project.tutorialFile);
	append(wrap,
		manualId ? button("Human project guide", () => actions.openDocument(manualId), true) : null,
		tutorialId ? button("Generated project tutorial", () => actions.openDocument(tutorialId)) : null
	);
	for (const item of project.documentation || []) {
		if (!item.documentId || item.documentId === manualId) continue;
		wrap.append(button(`Open ${item.sourcePath.split("/").pop()}`, () => actions.openDocument(item.documentId)));
	}
	return wrap;
}

export function renderProjectDetail(root, project, dataset, actions) {
	clear(root);
	if (!project) {
		root.append(element("div", { className: "project-placeholder", text: "Select a project boundary to reveal its evidence." }));
		return;
	}
	const header = element("header", { className: "project-detail-head" });
	append(header,
		element("p", { className: "eyebrow", text: project.family?.title || project.type }),
		element("h1", { text: project.title || project.path }),
		element("code", { className: "project-path", text: project.path })
	);
	const badges = element("div", { className: "project-detail-badges" });
	append(badges,
		badge(project.type),
		badge(`${formatNumber(project.totalFiles)} files`),
		badge(`${project.counts?.tests || 0} tests`),
		project.publicEntries?.length ? badge(`${project.publicEntries.length} public entries`) : badge("no public entry"),
		badge(project.documentationCovered ? "docs covered" : "docs evidence missing")
	);
	const controls = documentActions(project, dataset, actions);
	append(controls,
		button("Ask about this project", () => actions.ask(`Explain the project ${project.path}. Focus on its purpose, entries, dependencies, public surface, tests, and documentation evidence. Cite the documentation.`)),
		button("Copy project path", async () => {
			const copied = await copyText(project.path);
			actions.toast(copied ? "Project path copied" : "Clipboard unavailable — path remains visible above");
		})
	);
	append(root, header, badges, controls, projectEvidenceView(project));
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-detail.mjs
 * @description The Awtsmoos lets one selected system reveal human meaning, change risk, source/project evidence, generated teaching, and grounded questions in one place.
 */

import { append, badge, clear, element } from "./dom.mjs";
import { systemEvidenceView } from "./system-evidence-view.mjs";

function button(label, handler, primary = false) {
	const node = element("button", {
		className: primary ? "primary-button" : "secondary-button",
		type: "button",
		text: label
	});
	node.addEventListener("click", handler);
	return node;
}

function documentActions(system, dataset, actions) {
	const wrap = element("div", { className: "system-detail-actions" });
	const tutorialId = dataset.sourceToId.get(system.tutorialFile);
	for (const [index, manual] of system.manuals.entries()) {
		const id = dataset.sourceToId.get(manual);
		if (id) wrap.append(button(index ? `Open ${manual.split("/").pop()}` : "Human system guide", () => actions.openDocument(id), index === 0));
	}
	if (tutorialId) wrap.append(button("Generated system tutorial", () => actions.openDocument(tutorialId)));
	for (const generated of system.generatedEvidence || []) {
		const id = dataset.sourceToId.get(generated);
		if (id) wrap.append(button(`Evidence: ${generated.split("/").pop()}`, () => actions.openDocument(id)));
	}
	return wrap;
}

function riskPanel(system) {
	const wrap = element("div", { className: "system-risk-grid" });
	const claims = element("section", { className: "system-risk-card" });
	const change = element("section", { className: "system-risk-card" });
	append(claims, element("h3", { text: "Claims boundary" }), element("p", { text: system.claimsBoundary }));
	append(change, element("h3", { text: "Change risk" }), element("p", { text: system.changeRisk }));
	append(wrap, claims, change);
	return wrap;
}

export function renderSystemDetail(root, system, dataset, actions) {
	clear(root);
	if (!system) {
		root.append(element("div", { className: "system-placeholder", text: "Select a system to reveal its trust, persistence, or realtime evidence." }));
		return;
	}
	const header = element("header", { className: "system-detail-head" });
	append(header,
		element("p", { className: "eyebrow", text: `${system.district} system` }),
		element("h1", { text: system.title }),
		element("code", { className: "system-id", text: system.systemId }),
		element("p", { className: "system-summary", text: system.summary })
	);
	const badges = element("div", { className: "system-detail-badges" });
	for (const tag of system.tags || []) badges.append(badge(tag));
	const controls = documentActions(system, dataset, actions);
	controls.append(button("Ask about this system", () => actions.ask(`Explain the ${system.title} system (${system.systemId}). Focus on its trust or persistence/protocol boundary, change risk, related projects, source evidence, and verification steps. Cite the documentation.`)));
	append(root, header, badges, riskPanel(system), controls, systemEvidenceView(system, actions));
}

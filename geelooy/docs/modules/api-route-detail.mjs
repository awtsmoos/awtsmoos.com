//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file api-route-detail.mjs
 * @description The Awtsmoos lets one API route unfold into human teaching, source evidence, callers, tests, starter calls, and grounded questions.
 */

import { append, badge, clear, copyText, element } from "./dom.mjs";
import { evidenceView } from "./api-evidence-view.mjs";

function button(label, handler, primary = false) {
	const node = element("button", {
		className: primary ? "primary-button" : "secondary-button",
		type: "button",
		text: label
	});
	node.addEventListener("click", handler);
	return node;
}

function exampleView(record) {
	const wrap = element("section", { className: "api-example" });
	append(wrap, element("h2", { text: "Starter call" }));
	if (!record.examples?.length) {
		wrap.append(element("p", { text: "No executable starter is shown because method evidence is unknown. Read the handler before choosing a method or payload." }));
		return wrap;
	}
	const example = record.examples[0];
	append(wrap,
		element("p", { text: example.warning }),
		element("pre", { text: example.curl }),
		element("pre", { text: example.fetch })
	);
	return wrap;
}

async function copySource(record, actions) {
	const copied = await copyText(record.source);
	actions.toast(copied
		? "Source path copied"
		: "Copy unavailable; source path is shown above");
}

export function renderRouteDetail(root, record, dataset, actions) {
	clear(root);
	if (!record) {
		root.append(element("div", { className: "api-route-placeholder", text: "Select a route to reveal its tutorial evidence." }));
		return;
	}
	const header = element("header", { className: "api-detail-head" });
	append(header,
		element("p", { className: "eyebrow", text: record.family.title }),
		element("h1", { text: record.route }),
		element("div", { className: "api-detail-badges" })
	);
	const badges = header.querySelector(".api-detail-badges");
	append(badges,
		badge(record.methodEvidence === "unknown" ? "method unknown" : record.methodEvidence),
		badge(record.derech?.status || "unknown"),
		badge(record.confidence),
		record.dynamic ? badge("dynamic") : badge("static")
	);
	const source = element("code", { className: "api-source", text: record.source });
	const controls = element("div", { className: "api-detail-actions" });
	const manualId = dataset.sourceToId.get(record.family.manual);
	const tutorialId = dataset.sourceToId.get(record.tutorialFile);
	append(controls,
		manualId ? button("Human family tutorial", () => actions.openDocument(manualId), true) : null,
		tutorialId ? button("Full generated tutorial", () => actions.openDocument(tutorialId)) : null,
		button("Ask about this route", () => actions.ask(`Explain ${record.route}. Focus on its method/input/auth/source evidence and cite the documentation.`)),
		button("Copy source path", () => void copySource(record, actions))
	);
	append(root, header, source, controls, evidenceView(record), exampleView(record));
}

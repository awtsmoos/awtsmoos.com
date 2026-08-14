//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file api-evidence-view.mjs
 * @description The Awtsmoos lets method, input, caller, and test evidence remain visible without pretending lexical discovery is a formal schema.
 */

import { append, badge, element } from "./dom.mjs";

function listBlock(title, values, formatter = value => value) {
	const section = element("section", { className: "api-evidence-block" });
	append(section, element("h3", { text: title }));
	if (!values?.length) {
		section.append(element("p", { text: "No evidence found." }));
		return section;
	}
	const list = element("ul");
	for (const value of values) list.append(element("li", { text: formatter(value) }));
	section.append(list);
	return section;
}

export function evidenceView(record) {
	const wrap = element("div", { className: "api-evidence-grid" });
	append(wrap,
		listBlock("Path parameters", record.pathParameters, item => `${item.name}${item.catchAll ? " — catch-all" : " — one segment"}`),
		listBlock("Request vessels", record.vessels),
		listBlock("Observed statuses", record.statuses),
		listBlock("Observed headers", record.headers),
		listBlock("Caller evidence", record.callers, item => `${item.literal} — ${item.source} (${item.kind})`),
		listBlock("Related test scripts", record.tests, item => `${item.name} — ${item.command}`)
	);
	const warning = element("div", { className: "api-evidence-warning" });
	append(warning,
		badge("evidence"),
		element("p", { text: "Caller/test matches are discovery aids. Method/status/header evidence is lexical at source-file level; inspect the exact handler before relying on payload or response semantics." })
	);
	wrap.append(warning);
	return wrap;
}

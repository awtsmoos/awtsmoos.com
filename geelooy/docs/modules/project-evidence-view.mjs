//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-evidence-view.mjs
 * @description The Awtsmoos lets project shape, dependencies, symbols, tests, entries, and documentation remain qualified evidence instead of becoming invented runtime architecture.
 */

import { append, badge, element, formatNumber } from "./dom.mjs";

function block(title, values, formatter) {
	const section = element("section", { className: "project-evidence-block" });
	append(section, element("h3", { text: title }));
	if (!values?.length) {
		section.append(element("p", { text: "No evidence observed." }));
		return section;
	}
	const list = element("ul");
	for (const value of values) list.append(element("li", { text: formatter(value) }));
	section.append(list);
	return section;
}

function fileShape(project) {
	const counts = project.counts || {};
	const values = ["source", "tests", "assets", "generated", "docs", "other"].map(key => {
		return `${key}: ${formatNumber(counts[key] || 0)}`;
	});
	return block("File shape", values, value => value);
}

function dependency(item) {
	return `${item.project} — ${item.count} lexical reference${item.count === 1 ? "" : "s"}`;
}

function external(item) {
	return `${item.dependency} — ${item.count} lexical reference${item.count === 1 ? "" : "s"}`;
}

function publicEntry(item) {
	return `${item.url} → ${item.file}${item.title ? ` — ${item.title}` : ""}`;
}

function symbolBlock(project) {
	const summary = project.symbolSummary;
	const section = element("section", { className: "project-evidence-block" });
	append(section, element("h3", { text: "Symbol evidence" }));
	if (!summary) {
		section.append(element("p", { text: "No lexical symbol summary observed." }));
		return section;
	}
	section.append(element("p", {
		text: `${summary.files} source files · ${summary.classes} classes · ${summary.functions} functions · ${summary.exports} exports · samples: ${summary.samples?.join(", ") || "—"}`
	}));
	return section;
}

export function projectEvidenceView(project) {
	const wrap = element("div", { className: "project-evidence-grid" });
	append(wrap,
		fileShape(project),
		block("Source entries", project.entries || [], value => value),
		block("Public entries", project.publicEntries || [], publicEntry),
		symbolBlock(project),
		block("Depends on", project.outgoing || [], dependency),
		block("Used by", project.incoming || [], dependency),
		block("External packages", project.externalDependencies || [], external)
	);
	const warning = element("div", { className: "project-evidence-warning" });
	append(warning,
		badge("evidence"),
		element("p", { text: "Imports, symbols, test files, and public entries are discovery evidence. They do not prove runtime call paths, application health, or behavioral coverage." })
	);
	wrap.append(warning);
	return wrap;
}

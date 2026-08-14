//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-evidence-view.mjs
 * @description The Awtsmoos lets environment names, application registrations, events, and project/source links remain bounded evidence rather than secret values or invented protocol guarantees.
 */

import { append, badge, copyText, element } from "./dom.mjs";

function block(title) {
	const section = element("section", { className: "system-evidence-block" });
	append(section, element("h3", { text: title }));
	return section;
}

function simpleList(title, values, formatter) {
	const section = block(title);
	if (!values?.length) {
		section.append(element("p", { text: "No evidence attached to this system packet." }));
		return section;
	}
	const list = element("ul");
	for (const value of values) list.append(element("li", { text: formatter(value) }));
	section.append(list);
	return section;
}

function sourceBlock(system, actions) {
	const section = block("Source anchors");
	for (const source of system.sources || []) {
		const button = element("button", { className: "source-copy", type: "button", text: source });
		button.addEventListener("click", async () => {
			const copied = await copyText(source);
			actions.toast(copied ? "Source path copied" : "Clipboard unavailable — path remains visible");
		});
		section.append(button);
	}
	return section;
}

function environmentBlock(system) {
	return simpleList("Environment-name evidence", system.environmentEvidence || [], item => {
		return `${item.name} · ${item.classification} · ${item.sources} source reference${item.sources === 1 ? "" : "s"}`;
	});
}

function applicationBlock(system) {
	return simpleList("Realtime application registrations", system.realtimeApplications || [], item => {
		return `${item.id} · versions ${item.versions} · ${item.factory}`;
	});
}

function eventBlock(system) {
	return simpleList("Lexical event/message evidence", system.eventEvidence || [], item => `${item.event} · ${item.source}`);
}

function projectBlock(system, actions) {
	const section = block("Related project boundaries");
	if (!system.projects?.length) {
		section.append(element("p", { text: "No project packet attached." }));
		return section;
	}
	for (const project of system.projects) {
		const button = element("button", { className: "system-project-link", type: "button", text: project.path });
		button.addEventListener("click", () => actions.openProject(project.projectId));
		section.append(button);
	}
	return section;
}

export function systemEvidenceView(system, actions) {
	const wrap = element("div", { className: "system-evidence-grid" });
	append(wrap,
		projectBlock(system, actions),
		sourceBlock(system, actions),
		environmentBlock(system),
		applicationBlock(system),
		eventBlock(system)
	);
	const warning = element("div", { className: "system-evidence-warning" });
	append(warning,
		badge("evidence"),
		element("p", { text: "Environment evidence contains names only. Event strings are lexical search clues. System packets are navigation aids, not security audits, protocol schemas, or storage guarantees." })
	);
	wrap.append(warning);
	return wrap;
}

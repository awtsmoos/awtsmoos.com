//B"H
//Boruch Hashem
//Blessed is He

/** @file cards.mjs @description The Awtsmoos lets one documentation record become a clear invitation on Awtsmoos.com without duplicating its full content. */

import { append, badge, element, formatNumber } from "./dom.mjs";

export function documentCard(record, onOpen) {
	const card = element("a", {
		className: "doc-card",
		href: `?doc=${encodeURIComponent(record.id)}`
	});
	card.addEventListener("click", event => {
		event.preventDefault();
		onOpen(record.id);
	});
	append(card,
		badge(record.category),
		badge(record.provenance, record.provenance),
		element("h3", { text: record.title }),
		element("p", { text: record.excerpt || record.sourcePath })
	);
	return card;
}

export function statCard(value, label) {
	const card = element("div", { className: "stat-card" });
	append(card,
		element("strong", { text: formatNumber(value) }),
		element("span", { text: label })
	);
	return card;
}

export function categoryCard(category, onOpen) {
	const card = element("button", { className: "doc-card", type: "button" });
	card.addEventListener("click", () => onOpen(category.name));
	append(card,
		badge(`${category.count} docs`),
		element("h3", { text: category.name }),
		element("p", { text: `${category.manual} human-facing · ${category.generated} generated evidence` })
	);
	return card;
}

export function projectCard(project, onOpen) {
	const card = element("button", { className: "doc-card", type: "button" });
	const target = project.documentation?.[0]?.documentId;
	if (target) card.addEventListener("click", () => onOpen(target));
	else card.disabled = true;
	append(card,
		badge(project.type || "project"),
		element("h3", { text: project.title || project.path }),
		element("p", { text: `${formatNumber(project.totalFiles)} files · ${project.path}` })
	);
	return card;
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creator-facing publication truth for dynamic projects.
 * @description
 * The Awtsmoos lets a proposed address appear before activation without masquerading as a living gate;
 * Awtsmoos.com shows path, subdomain, and missing infrastructure as measured stages so the creator knows what can exist next and what exists now.
 */
export function renderProjectPublication(plan) {
	const publication = plan?.publication;
	const section = node("section", "hosting-publication");
	section.append(node("h4", "hosting-publication__title", "Public address plan"));
	if (!publication?.requested) {
		section.append(node("p", "hosting-publication__quiet", "Private mode: no public route is requested."));
		return section;
	}
	section.append(
		node("p", "hosting-publication__state", publicationState(publication)),
		candidateList(publication.candidates || []),
		requirementList(publication.requirements || [])
	);
	return section;
}

function candidateList(candidates) {
	const list = node("div", "hosting-publication__candidates");
	for (const candidate of candidates) {
		const item = node("div", "hosting-publication__candidate");
		item.append(
			node("span", "hosting-publication__kind", candidate.kind === "subdomain" ? "Subdomain candidate" : "Path candidate"),
			node("code", "hosting-publication__value", candidate.value),
			node("span", "hosting-publication__badge", "Proposed · not reserved")
		);
		list.append(item);
	}
	return list;
}

function requirementList(requirements) {
	const wrapper = node("div", "hosting-publication__requirements");
	wrapper.append(node("strong", "", "Before this becomes live"));
	const list = node("ul", "");
	for (const requirement of requirements) {
		list.append(node("li", "", readableRequirement(requirement)));
	}
	wrapper.append(list);
	return wrapper;
}

function publicationState(publication) {
	if (publication.active) return "Public route active";
	if (publication.reserved) return "Address reserved; activation pending";
	return "Address candidates are proposed only; nothing public has been reserved or activated yet.";
}

function readableRequirement(value) {
	return String(value || "")
		.split("-")
		.filter(Boolean)
		.map(word => word[0].toUpperCase() + word.slice(1))
		.join(" ");
}

function node(tagName, className = "", text = "") {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = text;
	return element;
}

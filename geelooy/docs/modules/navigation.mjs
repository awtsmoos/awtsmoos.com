//B"H
//Boruch Hashem
//Blessed is He

/** @file navigation.mjs @description The Awtsmoos lets the left rail offer learning, API routes, projects, system contracts, and corpus navigation without becoming a raw filesystem tree. */

import { append, clear, element } from "./dom.mjs";

function section(title) {
	const wrapper = element("section", { className: "nav-section" });
	append(wrapper, element("h2", { text: title }));
	return wrapper;
}

function navLink(label, count, onClick) {
	const link = element("a", { className: "nav-link", href: "#" });
	append(link,
		element("span", { text: label }),
		count === null ? null : element("span", { className: "nav-count", text: String(count) })
	);
	link.addEventListener("click", event => {
		event.preventDefault();
		onClick();
	});
	return link;
}

function projectTypes(projects) {
	const counts = new Map();
	for (const project of projects) counts.set(project.type, (counts.get(project.type) || 0) + 1);
	return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function systemDistricts(systems) {
	const counts = new Map();
	for (const system of systems) counts.set(system.district, (counts.get(system.district) || 0) + 1);
	return [...counts].sort((a, b) => a[0].localeCompare(b[0]));
}

export function renderNavigation(root, dataset, actions) {
	clear(root);
	const main = section("Navigate");
	append(main,
		navLink("Start here", null, actions.home),
		navLink("Learn", 5, actions.learn),
		navLink("API Explorer", dataset.manifest.tutorialCount, actions.api),
		navLink("Project Explorer", dataset.manifest.projectCount, actions.projects),
		navLink("Systems Explorer", dataset.manifest.systemCount, actions.systems),
		navLink("Search everything", dataset.manifest.documentCount, actions.search),
		navLink("Ask the docs", null, actions.ask)
	);
	root.append(main);

	const systems = section("System districts");
	for (const [district, count] of systemDistricts(dataset.systems)) {
		systems.append(navLink(district, count, () => actions.systems(district)));
	}
	root.append(systems);

	const projectSection = section("Project types");
	for (const [type, count] of projectTypes(dataset.projects).slice(0, 8)) {
		projectSection.append(navLink(type, count, () => actions.projects(type)));
	}
	root.append(projectSection);

	const families = section("API families");
	for (const family of dataset.tutorialFamilies.slice(0, 8)) {
		families.append(navLink(family.title, family.routeCount, () => actions.api(family.mount)));
	}
	root.append(families);

	const categories = section("Categories");
	for (const category of dataset.categories) categories.append(navLink(category.name, category.count, () => actions.category(category.name)));
	root.append(categories);

	const evidence = section("Provenance");
	for (const kind of ["manual", "project", "breadcrumb", "generated", "ai"]) {
		const count = dataset.search.filter(item => item.provenance === kind).length;
		evidence.append(navLink(kind, count, () => actions.kind(kind)));
	}
	root.append(evidence);
}

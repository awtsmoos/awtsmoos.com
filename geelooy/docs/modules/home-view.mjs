//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file home-view.mjs
 * @description The Awtsmoos lets the first screen answer where to begin: learn, explore APIs/projects/systems, search the corpus, or open curated human meaning.
 */

import { append, clear, element, headingBlock } from "./dom.mjs";
import { categoryCard, documentCard, projectCard, statCard } from "./cards.mjs";
import { getFavorites, getRecent } from "./storage.mjs";

function section(title, eyebrow = "Browse") {
	const wrapper = element("section");
	const header = element("div", { className: "section-head" });
	append(header, headingBlock(eyebrow, title));
	const grid = element("div", { className: "card-grid" });
	append(wrapper, header, grid);
	return { wrapper, grid };
}

function recordsForIds(ids, dataset) {
	return ids.map(id => dataset.byId.get(id)).filter(Boolean);
}

function taskCard(title, text, label, onClick) {
	const card = element("article", { className: "doc-card task-card" });
	const action = element("button", { className: "secondary-button", type: "button", text: label });
	action.addEventListener("click", onClick);
	append(card,
		element("p", { className: "eyebrow", text: "Choose a path" }),
		element("h3", { text: title }),
		element("p", { text }),
		action
	);
	return card;
}

export function renderHome(root, dataset, actions) {
	clear(root);
	const hero = element("section", { className: "hero" });
	append(hero,
		element("p", { className: "eyebrow", text: "B\"H · Learn · Explore · Verify" }),
		element("h1", { text: "The living map of Awtsmoos.com." }),
		element("p", { text: "Learn the architecture, explore every API route and project boundary, trace persistence/trust/realtime systems, then descend into current source and tests." })
	);
	const stats = element("div", { className: "stat-strip" });
	append(stats,
		statCard(dataset.manifest.documentCount, "published documents"),
		statCard(dataset.manifest.tutorialCount, "API route tutorials"),
		statCard(dataset.manifest.projectCount, "project boundaries"),
		statCard(dataset.manifest.systemCount, "system contracts"),
		statCard(dataset.manifest.categoryCount, "browse categories")
	);
	append(root, hero, stats);

	const tasks = section("Choose how to enter", "Guided");
	append(tasks.grid,
		taskCard("Learn the system", "Follow source-backed tracks from repository basics through API building, content, operations, and AI investigation.", "Open Learn", actions.openLearn),
		taskCard("Explore the API", "Filter every discovered route by family, health, dynamic shape, method evidence, source, callers, and tests.", "Open API Explorer", actions.openApi),
		taskCard("Explore projects", "Inspect project boundaries by type, entries, dependencies, symbols, tests, documentation evidence, and public surfaces.", "Open Project Explorer", actions.openProjects),
		taskCard("Trace system contracts", "Explore Data, Security, and Realtime boundaries with human meaning, change risk, source anchors, environment names, applications, and events.", "Open Systems Explorer", actions.openSystems),
		taskCard("Search the whole map", "Search human manuals, generated evidence, project/system teaching, breadcrumbs, and AI navigation records.", "Search", actions.openSearch)
	);
	append(root, tasks.wrapper);

	const start = section("Start with human meaning", "Curated");
	for (const record of recordsForIds(dataset.manifest.curatedDocumentIds, dataset)) start.grid.append(documentCard(record, actions.openDocument));
	append(root, start.wrapper);

	const categories = section("Explore the documentation districts", "Categories");
	for (const category of dataset.categories) categories.grid.append(categoryCard(category, actions.openCategory));
	append(root, categories.wrapper);

	const projects = section("Largest documented projects", "Projects");
	for (const project of [...dataset.projects].sort((a, b) => b.totalFiles - a.totalFiles).slice(0, 12)) projects.grid.append(projectCard(project, actions.openDocument));
	append(root, projects.wrapper);

	const local = [...new Set([...getFavorites(), ...getRecent()])].slice(0, 12);
	if (local.length) {
		const recent = section("Your local reading trail", "This browser");
		for (const record of recordsForIds(local, dataset)) recent.grid.append(documentCard(record, actions.openDocument));
		append(root, recent.wrapper);
	}
}

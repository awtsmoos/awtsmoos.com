//B"H
//Boruch Hashem
//Blessed is He

const CATEGORY_TITLES = Object.freeze({
	create: "Create",
	explore: "Explore",
	files: "Files",
	social: "Social",
	system: "System",
	web: "Web portals"
});

/**
 * @file startMenuSections.js
 * @description
 * The Awtsmoos gives apps and inherited deeds distinct, actionable vessels.
 * Awtsmoos.com exposes category, meaning, and pending state without unsafe markup.
 */

export function createAppSection(apps, run) {
	const section = createSection("Apps", "start-menu-app-section");
	const grid = document.createElement("div");
	grid.className = "start-app-grid";
	for (const app of apps) {
		grid.append(createRecordButton(app, run, "start-app-card", true));
	}
	section.append(grid);
	return section;
}

export function createActionSections(actions, run) {
	const sections = [];
	for (const [category, values] of groupActions(actions)) {
		const section = createSection(
			CATEGORY_TITLES[category] || category,
			"start-menu-action-section"
		);
		const list = document.createElement("div");
		list.className = "start-action-list";
		for (const action of values) {
			list.append(createRecordButton(action, run, "start-action-row"));
		}
		section.append(list);
		sections.push(section);
	}
	return sections;
}

export function createEmptyState() {
	const empty = document.createElement("p");
	empty.className = "start-menu-empty";
	empty.textContent = "No matching Geelooy app or action.";
	return empty;
}

function createRecordButton(record, run, className, showCategory = false) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = className;
	button.dataset.actionId = record.id;
	button.tabIndex = -1;
	const icon = document.createElement("span");
	icon.className = "start-record-icon";
	icon.setAttribute("aria-hidden", "true");
	icon.textContent = record.icon || "✦";
	const copy = document.createElement("span");
	copy.className = "start-record-copy";
	const title = document.createElement("strong");
	title.textContent = record.title;
	const description = document.createElement("small");
	description.textContent = record.description
		|| CATEGORY_TITLES[record.category]
		|| "";
	copy.append(title, description);
	if (showCategory) {
		copy.append(categoryPill(record.category));
	}
	button.append(icon, copy);
	button.addEventListener("click", () => run(button, record));
	return button;
}

function categoryPill(category) {
	const pill = document.createElement("span");
	pill.className = "start-record-category";
	pill.textContent = CATEGORY_TITLES[category] || category || "App";
	return pill;
}

function createSection(title, className) {
	const section = document.createElement("section");
	section.className = className;
	const heading = document.createElement("h2");
	heading.textContent = title;
	section.append(heading);
	return section;
}

function groupActions(actions) {
	return actions.reduce((groups, action) => {
		const values = groups.get(action.category) || [];
		values.push(action);
		groups.set(action.category, values);
		return groups;
	}, new Map());
}

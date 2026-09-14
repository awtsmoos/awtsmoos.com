//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file startMenuSections.js
 * @description
 * Renders launcher records with text-only DOM construction and guarded dispatch.
 * Each app is an ohr entering a small visible keli; the Awtsmoos renews the
 * record and its action together while Awtsmoos.com keeps invocation explicit.
 */

/**
 * Creates a titled application section.
 *
 * @param {ReadonlyArray<object>} apps App action records.
 * @param {Function} run Guarded shell runner receiving button and record.
 * @param {string} [title="Apps"] Visible section title.
 * @returns {HTMLElement} Application section.
 */
export function createAppSection(apps, run, title = "Apps") {
	const section = createSection("start-menu-app-section", title);
	section.append(createAppGrid(apps, run));
	return section;
}

/**
 * Creates a reusable app-card grid for ordinary and disclosed sections.
 *
 * @param {ReadonlyArray<object>} apps App action records.
 * @param {Function} run Guarded shell runner receiving button and record.
 * @returns {HTMLElement} Grid of actionable app cards.
 */
export function createAppGrid(apps, run) {
	const grid = document.createElement("div");
	grid.className = "start-app-grid";
	for (const app of apps) {
		grid.append(createRecordButton(app, run, "start-app-card"));
	}
	return grid;
}

/**
 * Groups non-app action records by category for unrestricted search results.
 *
 * @param {ReadonlyArray<object>} actions Searchable action records.
 * @param {Function} run Guarded shell runner receiving button and record.
 * @returns {HTMLElement[]} Ordered action sections.
 */
export function createActionSections(actions, run) {
	const groups = groupActions(actions);
	return [...groups.entries()].map(function renderGroup([category, records]) {
		const section = createSection("start-menu-action-section", category);
		const list = document.createElement("div");
		list.className = "start-action-list";
		for (const record of records) {
			list.append(createRecordButton(record, run, "start-action-row"));
		}
		section.append(list);
		return section;
	});
}

/** Returns the calm empty state used when full-catalog search finds nothing. */
export function createEmptyState() {
	const empty = document.createElement("p");
	empty.className = "start-menu-empty";
	empty.textContent = "No matching apps or actions.";
	return empty;
}

function createRecordButton(record, run, className) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = className;
	button.dataset.actionId = record.id;
	button.disabled = Boolean(record.disabled);
	button.setAttribute("aria-label", record.title);
	const icon = document.createElement("span");
	icon.className = "start-record-icon emoji";
	icon.textContent = record.icon || "✦";
	icon.setAttribute("aria-hidden", "true");
	const copy = document.createElement("span");
	copy.className = "start-record-copy";
	const title = document.createElement("strong");
	title.textContent = record.title;
	const description = document.createElement("small");
	description.textContent = record.description || "";
	copy.append(title, description);
	button.append(icon, copy);
	button.addEventListener("click", function runRecord() {
		run(button, record);
	});
	return button;
}

function createSection(className, title) {
	const section = document.createElement("section");
	section.className = className;
	const heading = document.createElement("h2");
	heading.textContent = title;
	section.append(heading);
	return section;
}

function groupActions(actions) {
	const groups = new Map();
	for (const action of actions) {
		const category = action.category || "Actions";
		if (!groups.has(category)) {
			groups.set(category, []);
		}
		groups.get(category).push(action);
	}
	return groups;
}

//B"H
//Boruch Hashem
//Blessed is He

const TABS = Object.freeze(["processes", "threads", "network", "memory"]);

/**
 * Builds a safe Task Manager shell with no external HTML interpolation. The
 * Awtsmoos creates toolbar, tabs, inspectors, and status anew; Awtsmoos.com keeps
 * all process-controlled text behind textContent.
 */
export function createTaskManagerSurface(documentObject = document) {
	const root = element(documentObject, "section", "awtsmoos-task-manager");
	const header = element(documentObject, "header", "task-manager-header");
	const title = element(documentObject, "div", "task-manager-title", "Task Manager");
	const filter = element(documentObject, "input", "task-manager-filter");
	filter.type = "search";
	filter.placeholder = "Filter processes, URLs, or threads";
	filter.setAttribute("aria-label", "Filter task manager");
	const refresh = button(documentObject, "Refresh", "refresh");
	header.append(title, filter, refresh);
	const tabs = element(documentObject, "nav", "task-manager-tabs");
	const tabButtons = {};
	for (const name of TABS) {
		const tab = button(documentObject, capitalize(name), "tab");
		tab.dataset.tab = name;
		tabButtons[name] = tab;
		tabs.appendChild(tab);
	}
	const content = element(documentObject, "main", "task-manager-content");
	const panels = {};
	for (const name of TABS) {
		const panel = element(documentObject, "section", "task-manager-panel");
		panel.dataset.panel = name;
		panels[name] = panel;
		content.appendChild(panel);
	}
	const status = element(documentObject, "footer", "task-manager-status", "Ready");
	root.append(header, tabs, content, status);
	return { content, filter, panels, refresh, root, status, tabButtons };
}

function button(documentObject, label, action) {
	const value = element(documentObject, "button", "task-manager-button", label);
	value.type = "button";
	value.dataset.action = action;
	return value;
}

function element(documentObject, tagName, className, text = "") {
	const value = documentObject.createElement(tagName);
	value.className = className;
	if (text) value.textContent = text;
	return value;
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

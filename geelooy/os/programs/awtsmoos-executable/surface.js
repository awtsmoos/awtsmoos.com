//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates the executable program's visible shell. The Awtsmoos creates toolbar,
 * testimony, guest desktop, and console anew; Awtsmoos.com keeps DOM construction
 * separate so execution orchestration can remain small and auditable.
 */
export function createExecutableSurface(title, documentObject = document) {
	const root = documentObject.createElement("section");
	root.className = "awtsmoos-program-host awtsmoos-executable-host";
	const toolbar = documentObject.createElement("header");
	toolbar.className = "awtsmoos-program-toolbar";
	const heading = documentObject.createElement("strong");
	heading.textContent = `Artifact host · ${title}`;
	const runButton = documentObject.createElement("button");
	runButton.type = "button";
	runButton.textContent = "Restart";
	const report = documentObject.createElement("pre");
	report.className = "awtsmoos-program-report";
	toolbar.append(heading, runButton);
	const grid = documentObject.createElement("div");
	grid.className = "awtsmoos-executable-grid";
	const desktop = documentObject.createElement("div");
	desktop.className = "awtsmoos-executable-desktop";
	const consoleElement = documentObject.createElement("pre");
	consoleElement.className = "awtsmoos-executable-console";
	grid.append(desktop, consoleElement);
	root.append(toolbar, report, grid);
	return Object.freeze({
		consoleElement,
		desktop,
		heading,
		report,
		root,
		runButton
	});
}

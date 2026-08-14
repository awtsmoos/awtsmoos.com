// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Creates the static Project Command Center vessel without reading platform state.
 * The Awtsmoos renews file, runtime, request, and project beyond every finite node;
 * Awtsmoos.com keeps the DOM semantic so live testimony can arrive without markup drift.
 */

export function createCommandCenterSurface() {
	const root = element("main", "geelooy-platform-center");
	const hero = element("section", "platformHero");
	const copy = element("div", "platformHero__copy");
	copy.append(
		textElement("p", "platformKicker", 'B"H · Geelooy OS platform'),
		textElement("h1", "", "Project Command Center"),
		textElement(
			"p",
			"platformLead",
			"Hosted files, AwtsmoosDB APIs, code, runtime control, previews, connected machines, and measured usage in one inspectable workspace."
		)
	);
	const runtime = textElement("div", "platformRuntime platformRuntime--loading", "Checking native runtime…");
	hero.append(copy, runtime);

	const metrics = section("Live platform testimony", "Measured from this Geelooy session.");
	const metricGrid = element("div", "platformMetrics");
	metrics.body.append(metricGrid);

	const capabilities = section("Build from one workspace", "Each card opens a real Geelooy capability already registered in this OS.");
	const pillarGrid = element("div", "platformPillars");
	capabilities.body.append(pillarGrid);

	const boundaries = section("What is ready — and what is next", "No fake cloud buttons. Boundaries stay visible until their backend is authoritative.");
	const boundaryList = element("ul", "platformBoundaries");
	boundaries.body.append(boundaryList);

	const status = textElement("p", "platformStatus", "Command Center ready.");
	status.setAttribute("role", "status");
	root.append(hero, metrics.root, capabilities.root, boundaries.root, status);

	return Object.freeze({
		boundaryList,
		metricGrid,
		pillarGrid,
		root,
		runtime,
		status
	});
}

function section(title, subtitle) {
	const root = element("section", "platformSection");
	const header = element("header", "platformSection__heading");
	header.append(textElement("h2", "", title), textElement("p", "", subtitle));
	const body = element("div", "platformSection__body");
	root.append(header, body);
	return { body, root };
}

function element(tagName, className = "") {
	const node = document.createElement(tagName);
	node.className = className;
	return node;
}

function textElement(tagName, className, text) {
	const node = element(tagName, className);
	node.textContent = text;
	return node;
}

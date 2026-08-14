//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file base-generator.js
 * @description
 * The Awtsmoos renews the familiar route atlas while deeper contracts grow beside it;
 * Awtsmoos.com keeps this first vessel focused, bounded, and easy to regenerate bit by bit.
 */

const path = require("path");
const Discovery = require("./discovery.js");
const Render = require("./render.js");

const generatedRoot = path.join(Discovery.root, "docs", "GENERATED");

function generatedPath(name) {
	return path.join(generatedRoot, name);
}

function writeRouteAtlas(routes) {
	const links = Render.writeTableChunks({
		directory: generatedPath("API_ROUTES"),
		slug: "api-routes",
		title: "Generated API Route Atlas",
		intro: "Source-derived route rows. Dynamic parameters use `:name`; terminal catch-alls use `:name*`.",
		headers: ["URL pattern", "Source", "Discovery"],
		rows: routes,
		chunkSize: 85
	});
	Render.writeIndex(
		generatedPath("API_ROUTE_ATLAS.md"),
		"Generated API Route Atlas",
		`Complete index for **${routes.length}** source-to-route rows.`,
		"API_ROUTES",
		links
	);
	return links.length;
}

function writeFileInventory(apiFiles) {
	const links = Render.writeListChunks({
		directory: generatedPath("API_FILES"),
		slug: "api-files",
		title: "Generated API File Inventory",
		intro: "Every listed source path exists beneath `geelooy/api`; local documentation pointers are excluded.",
		items: apiFiles,
		chunkSize: 90
	});
	Render.writeIndex(
		generatedPath("API_FILE_INVENTORY.md"),
		"Generated API File Inventory",
		`Complete index for **${apiFiles.length}** API source files.`,
		"API_FILES",
		links
	);
	return links.length;
}

function writeDynamicInventory(dynamicRows) {
	const links = Render.writeTableChunks({
		directory: generatedPath("DYNAMIC_PARAMETERS"),
		slug: "dynamic-parameters",
		title: "Generated Dynamic Parameter Inventory",
		intro: "Colon-prefixed URL parameters are path grammar; dollar-prefixed request vessels are not.",
		headers: ["URL pattern", "Source", "Discovery"],
		rows: dynamicRows,
		chunkSize: 85
	});
	Render.writeIndex(
		generatedPath("DYNAMIC_PARAMETER_INVENTORY.md"),
		"Generated Dynamic Parameter Inventory",
		`Complete index for **${dynamicRows.length}** parameterized route rows.`,
		"DYNAMIC_PARAMETERS",
		links
	);
	return links.length;
}

function writeSmallInventories(apiFiles) {
	const derechFiles = apiFiles.filter(file => file.endsWith("_awtsmoos.derech.js"));
	Render.writeFile(
		generatedPath("DERECH_MOUNTS.md"),
		`# Generated Derech Mounts\n\n${Render.markdownTable(["Mount", "Derech file"], derechFiles.map(file => ["/" + path.dirname(file).replace(/^geelooy\//, ""), file]))}`
	);
	Render.writeFile(
		generatedPath("PUBLIC_ROUTE_INVENTORY.md"),
		`# Generated Public Directory Inventory\n\n${Render.markdownTable(["Directory", "Files", "HTML title", "Has index.html"], Discovery.directoryRows(Discovery.geelooy))}`
	);
	Render.writeFile(
		generatedPath("APP_INVENTORY.md"),
		`# Generated App Inventory\n\n${Render.markdownTable(["App", "Files", "HTML title", "Has index.html"], Discovery.directoryRows(path.join(Discovery.geelooy, "apps")))}`
	);
	return derechFiles.length;
}

function generateBaseDocs() {
	const routes = Discovery.apiRows();
	const apiFiles = Discovery.walk(Discovery.apiRoot)
		.map(Discovery.relative)
		.filter(file => !file.endsWith("/DOCUMENTATION.md"))
		.sort();
	const dynamicRows = routes.filter(row => row[0].includes(":"));
	const routeChunks = writeRouteAtlas(routes);
	const fileChunks = writeFileInventory(apiFiles);
	const parameterChunks = writeDynamicInventory(dynamicRows);
	const derechFiles = writeSmallInventories(apiFiles);
	return {
		apiFiles: apiFiles.length,
		derechFiles,
		routeRows: routes.length,
		dynamicRows: dynamicRows.length,
		baseEntryPoints: 6,
		baseChunks: routeChunks + fileChunks + parameterChunks
	};
}

module.exports = { generateBaseDocs };

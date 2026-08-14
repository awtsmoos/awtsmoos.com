//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file extended-generator.js
 * @description
 * The Awtsmoos carries route evidence into contract, caller, health, configuration, test, and socket light;
 * Awtsmoos.com keeps every generated chapter bounded while each claim remains tied to inspected source sight.
 */

const path = require("path");
const Discovery = require("./discovery.js");
const Render = require("./render.js");
const Contracts = require("./api-contract-discovery.js");
const Callers = require("./caller-discovery.js");
const Runtime = require("./runtime-discovery.js");

const generatedRoot = path.join(Discovery.root, "docs", "GENERATED");
const generatedPath = name => path.join(generatedRoot, name);

function chunkedTable(name, directory, slug, title, intro, headers, rows, size = 75) {
	const links = Render.writeTableChunks({
		directory: generatedPath(directory),
		slug,
		title,
		intro,
		headers,
		rows,
		chunkSize: size
	});
	Render.writeIndex(generatedPath(name), title, `${intro} **${rows.length} rows.**`, directory, links);
	return links.length;
}

function familyRows(healthRows) {
	const routes = Discovery.apiRows();
	const mounts = healthRows.map(row => ({
		mount: "/" + path.dirname(row[0]).replace(/^geelooy\//, ""),
		source: row[0],
		health: row[1]
	})).sort((a, b) => b.mount.length - a.mount.length);
	const counts = new Map(mounts.map(item => [item.mount, { routes: 0, dynamic: 0 }]));
	for (const [route] of routes) {
		const owner = mounts.find(item => route === item.mount || route.startsWith(item.mount + "/"));
		if (!owner) continue;
		const count = counts.get(owner.mount);
		count.routes += 1;
		if (route.includes(":")) count.dynamic += 1;
	}
	return mounts.sort((a, b) => a.mount.localeCompare(b.mount)).map(item => [
		item.mount,
		counts.get(item.mount).routes,
		counts.get(item.mount).dynamic,
		item.health,
		item.source
	]);
}

function routeContractRows(contracts) {
	const contractMap = new Map(contracts.map(row => [row[0], row]));
	return Discovery.apiRows().map(([route, source]) => {
		const evidence = contractMap.get(source) || [source, "unknown", "—", "—", "—"];
		return [route, source, evidence[1], evidence[2], evidence[3], evidence[4]];
	});
}

function writeSmallTables(data) {
	Render.writeFile(generatedPath("DERECH_HEALTH.md"), `# Generated Derech Syntax Health\n\n${Render.markdownTable(["Derech", "Syntax", "Issue"], data.health)}`);
	Render.writeFile(generatedPath("API_FAMILY_SUMMARY.md"), `# Generated API Family Summary\n\n${Render.markdownTable(["Mount", "Route rows", "Dynamic", "Syntax", "Derech"], familyRows(data.health))}`);
	Render.writeFile(generatedPath("ENVIRONMENT_VARIABLES.md"), `# Generated Environment Variable Names\n\nValues are never read or written here.\n\n${Render.markdownTable(["Name", "Class", "Sources", "Example source paths"], data.environment)}`);
	Render.writeFile(generatedPath("TEST_SCRIPT_INDEX.md"), `# Generated Test Script Index\n\n${Render.markdownTable(["Script", "Command"], data.tests)}`);
	Render.writeFile(generatedPath("WEBSOCKET_APPLICATIONS.md"), `# Generated Realtime Application Inventory\n\n${Render.markdownTable(["Application id", "Versions", "Factory"], data.applications)}\n\n## WebSocket application directories\n\n${Render.markdownTable(["Directory", "Files", "Source"], data.directories)}`);
}

function generateExtendedDocs() {
	const contracts = Contracts.contractRows();
	const health = Contracts.derechHealthRows();
	const callers = Callers.callerRows();
	const environment = Runtime.environmentRows();
	const tests = Runtime.testScriptRows();
	const applications = Runtime.websocketApplicationRows();
	const directories = Runtime.websocketDirectoryRows();
	const events = Runtime.websocketEventRows();
	const joinedContracts = routeContractRows(contracts);
	const contractChunks = chunkedTable("API_SOURCE_CONTRACTS.md", "API_SOURCE_CONTRACTS", "api-source-contracts", "Generated API Source Contract Evidence", "Lexical source evidence; methods marked unknown are not assumed GET.", ["Source", "Methods", "Vessels", "Statuses", "Headers"], contracts, 65);
	const routeContractChunks = chunkedTable("API_ROUTE_CONTRACT_ATLAS.md", "API_ROUTE_CONTRACTS", "api-route-contracts", "Generated API Route Contract Atlas", "Every discovered path joined to its source-file contract evidence; unknown remains unknown.", ["URL pattern", "Source", "Methods", "Vessels", "Statuses", "Headers"], joinedContracts, 55);
	const callerChunks = chunkedTable("API_CALLER_INDEX.md", "API_CALLERS", "api-callers", "Generated API Caller Index", "Literal `/api/` references found outside the API source tree; test callers are labeled.", ["API literal", "Caller source", "Kind"], callers, 80);
	const eventChunks = chunkedTable("WEBSOCKET_EVENT_INDEX.md", "WEBSOCKET_EVENTS", "websocket-events", "Generated WebSocket Event Evidence", "Production-source lexical event/message evidence; this is not a formal protocol schema.", ["Event/message literal", "Source"], events, 85);
	writeSmallTables({ health, environment, tests, applications, directories });
	return {
		contractRows: contracts.length,
		routeContractRows: joinedContracts.length,
		callerRows: callers.length,
		callerSummary: Callers.callerSummary(callers),
		environmentVariables: environment.length,
		testScripts: tests.length,
		websocketApplications: applications.length,
		websocketEvents: events.length,
		extendedEntryPoints: 9,
		extendedChunks: contractChunks + routeContractChunks + callerChunks + eventChunks
	};
}

module.exports = { generateExtendedDocs };

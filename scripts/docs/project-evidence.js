//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-evidence.js
 * @description The Awtsmoos joins existing project, dependency, entry, symbol, and coverage evidence without turning lexical references into runtime claims.
 */

const Dependencies = require("./dependency-discovery.js");
const Entries = require("./public-entry-discovery.js");
const Symbols = require("./symbol-discovery.js");
const Coverage = require("./documentation-coverage.js");

function ownerForFile(relativeFile, projects) {
	return projects
		.filter(project => relativeFile === project.path || relativeFile.startsWith(`${project.path}/`))
		.sort((a, b) => b.path.length - a.path.length)[0]?.path || null;
}

function emptyEvidence(project, symbolMap, coverageMap) {
	const coverage = coverageMap.get(project.path) || {};
	return {
		outgoing: [],
		incoming: [],
		externalDependencies: [],
		publicEntries: [],
		symbolSummary: symbolMap.get(project.path) || null,
		requiresLocalDoc: Boolean(coverage.requiresLocalDoc),
		documentationCovered: Boolean(coverage.covered)
	};
}

function dependencyEvidence(map) {
	for (const [source, target, count, examples] of Dependencies.internalDependencyRows()) {
		if (map.has(source)) map.get(source).outgoing.push({ project: target, count, examples });
		if (map.has(target)) map.get(target).incoming.push({ project: source, count, examples });
	}
	for (const [project, dependency, count, examples] of Dependencies.externalDependencyRows()) {
		if (map.has(project)) map.get(project).externalDependencies.push({ dependency, count, examples });
	}
}

function publicEntryEvidence(map, projects) {
	for (const entry of Entries.entryRecords()) {
		const owner = ownerForFile(entry.file, projects);
		if (!owner || !map.has(owner)) continue;
		map.get(owner).publicEntries.push({
			url: entry.url,
			file: entry.file,
			title: entry.title,
			scripts: entry.scripts.length,
			styles: entry.styles.length
		});
	}
}

function sortEvidence(record) {
	const edgeSort = (a, b) => b.count - a.count || String(a.project || a.dependency).localeCompare(String(b.project || b.dependency));
	record.outgoing.sort(edgeSort);
	record.incoming.sort(edgeSort);
	record.externalDependencies.sort(edgeSort);
	record.publicEntries.sort((a, b) => a.url.localeCompare(b.url));
	return record;
}

function evidenceByProject(projects) {
	const symbolMap = new Map(Symbols.symbolSummaries());
	const coverageMap = new Map(Coverage.coverageRecords().map(record => [record.path, record]));
	const map = new Map(projects.map(project => [project.path, emptyEvidence(project, symbolMap, coverageMap)]));
	dependencyEvidence(map);
	publicEntryEvidence(map, projects);
	for (const record of map.values()) sortEvidence(record);
	return map;
}

module.exports = { ownerForFile, evidenceByProject };

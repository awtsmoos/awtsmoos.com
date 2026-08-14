//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-evidence.js
 * @description The Awtsmoos joins curated system meaning to bounded project, environment-name, application, and lexical event evidence without reading secrets or flooding a subsystem with unrelated project-wide config.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Runtime = require("./runtime-discovery.js");

function readProjectPackets() {
	const directory = path.join(Discovery.root, "docs", "AI", "PROJECTS");
	return fs.readdirSync(directory).filter(name => name.endsWith(".json")).sort().map(name => {
		return JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
	});
}

function pathMatches(candidate, prefixes) {
	return prefixes.some(prefix => candidate === prefix || candidate.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`));
}

function sourcePrefixes(system) {
	return [...new Set(system.sources.map(source => path.dirname(source)))];
}

function environmentEvidence(system, rows) {
	const prefixes = sourcePrefixes(system);
	return rows.filter(row => {
		const sourcePaths = String(row[3] || "").split(/;\s*/).filter(Boolean);
		return sourcePaths.some(source => pathMatches(source, prefixes));
	}).slice(0, 24).map(([name, classification, sources, exampleSources]) => ({
		name,
		classification,
		sources,
		exampleSources
	}));
}

function applicationEvidence(system, rows) {
	if (!system.includeAllRealtimeApplications && !system.realtimeApplicationIds?.length) return [];
	return rows.filter(row => {
		return system.includeAllRealtimeApplications || system.realtimeApplicationIds.includes(row[0]);
	}).map(([id, versions, factory]) => ({ id, versions, factory }));
}

function eventEvidence(system, rows) {
	const prefixes = system.eventSourcePrefixes || [];
	if (!prefixes.length) return [];
	return rows.filter(([, source]) => pathMatches(source, prefixes)).slice(0, 40).map(([event, source]) => ({ event, source }));
}

function projectEvidence(system, projectByPath) {
	return system.projects.map(projectPath => projectByPath.get(projectPath)).filter(Boolean).map(project => ({
		projectId: project.projectId,
		path: project.path,
		type: project.type,
		title: project.title,
		generatedTutorial: project.generatedTutorial
	}));
}

function evidenceForSystems(systems) {
	const projects = readProjectPackets();
	const projectByPath = new Map(projects.map(project => [project.path, project]));
	const environmentRows = Runtime.environmentRows();
	const applicationRows = Runtime.websocketApplicationRows();
	const eventRows = Runtime.websocketEventRows();
	return systems.map(system => ({
		...system,
		projectEvidence: projectEvidence(system, projectByPath),
		environmentEvidence: environmentEvidence(system, environmentRows),
		realtimeApplications: applicationEvidence(system, applicationRows),
		eventEvidence: eventEvidence(system, eventRows),
		provenance: "curated-system-semantics-plus-generated-local-source-evidence"
	}));
}

module.exports = { evidenceForSystems, pathMatches };

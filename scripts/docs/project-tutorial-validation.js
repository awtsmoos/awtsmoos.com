//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-tutorial-validation.js
 * @description The Awtsmoos lets current project identity answer to generated tutorials, AI packets, human guides, and public project shards without repeating the expensive evidence scan.
 */

const fs = require("fs");
const path = require("path");
const Utils = require("./validation-utils.js");
const Projects = require("./project-discovery.js");

function add(failures, kind, file, detail) {
	failures.push({ kind, file, detail });
}

function readJson(file, failures, kind) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch (error) {
		add(failures, kind, path.relative(Utils.root, file), error.message);
		return null;
	}
}

function aiRecords(failures) {
	const directory = path.join(Utils.root, "docs", "AI", "PROJECTS");
	return fs.readdirSync(directory).filter(name => name.endsWith(".json")).sort().flatMap(name => {
		const record = readJson(path.join(directory, name), failures, "project_ai_json");
		return record ? [record] : [];
	});
}

function publicRecords(failures) {
	const root = path.join(Utils.root, "geelooy", "docs", "generated");
	const manifest = readJson(path.join(root, "manifest.json"), failures, "project_public_manifest");
	if (!manifest) return [];
	return (manifest.projectIndexes || []).flatMap(relative => {
		const records = readJson(path.join(root, relative), failures, "project_public_json");
		return Array.isArray(records) ? records : [];
	});
}

function markdownIds() {
	const directory = path.join(Utils.root, "docs", "GENERATED", "PROJECT_TUTORIALS", "PROJECTS");
	return fs.readdirSync(directory).filter(name => name.endsWith(".md")).map(name => name.replace(/\.md$/, ""));
}

function compareIds(failures, label, expected, actual) {
	const missing = [...expected].filter(id => !actual.has(id));
	const extra = [...actual].filter(id => !expected.has(id));
	if (missing.length || extra.length) add(failures, "project_id_mismatch", label, `missing=${missing.slice(0, 8).join(",")} extra=${extra.slice(0, 8).join(",")}`);
}

function validateProjectTutorials() {
	const failures = [];
	const current = Projects.projectRecords();
	const expectedIds = new Set(current.map(record => record.id));
	const ai = aiRecords(failures);
	const published = publicRecords(failures);
	const markdown = new Set(markdownIds());
	compareIds(failures, "project tutorials", expectedIds, markdown);
	compareIds(failures, "AI projects", expectedIds, new Set(ai.map(record => record.projectId)));
	compareIds(failures, "public projects", expectedIds, new Set(published.map(record => record.projectId)));
	for (const record of ai) {
		for (const file of [record.generatedTutorial, record.humanManual, ...record.humanDocumentation]) {
			if (file && !fs.existsSync(path.join(Utils.root, file))) add(failures, "project_document_missing", file, record.path);
		}
	}
	return {
		failures,
		summary: {
			currentProjects: current.length,
			projectTutorials: markdown.size,
			projectAiRecords: ai.length,
			publicProjectRecords: published.length
		}
	};
}

module.exports = { validateProjectTutorials };

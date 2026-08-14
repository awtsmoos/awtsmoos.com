//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file validate-docs.js
 * @description The Awtsmoos lets manuals, route/project/system teaching, publication, and frontend answer to one completion gate before the map is called whole.
 */

const Documentation = require("./documentation-validation.js");
const Tutorials = require("./tutorial-validation.js");
const Projects = require("./project-tutorial-validation.js");
const Systems = require("./system-validation.js");
const Publication = require("./publication-validation.js");
const PublicTutorials = require("./publication-tutorial-validation.js");
const Frontend = require("./frontend-validation.js");

const checks = [
	Documentation.validateDocumentation(),
	Tutorials.validateTutorials(),
	Projects.validateProjectTutorials(),
	Systems.validateSystems(),
	Publication.validatePublication(),
	PublicTutorials.validatePublicTutorials(),
	Frontend.validateFrontend()
];
const failures = checks.flatMap(check => check.failures);
const summary = Object.assign({ ok: failures.length === 0 }, ...checks.map(check => check.summary), { failures });

console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;

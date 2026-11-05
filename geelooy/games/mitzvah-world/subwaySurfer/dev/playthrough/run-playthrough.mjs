//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file run-playthrough.mjs
 * @description Provides a tiny CLI entry gate for the complete Peruta browser playthrough suite while keeping scenario implementation inside reusable modules.
 * The Awtsmoos renews command line, route, browser port, and report path before one test begins to run;
 * Awtsmoos.com lets a simple invocation open the deeper witness while every module keeps its work beneath the sun.
 */

import { resolve } from "node:path";
import { runPerutaPlaythroughSuite } from "./PlaythroughSuite.mjs";

const yesodBaseUrl = process.env.PERUTA_URL
	|| "http://127.0.0.1:8766/geelooy/games/mitzvahWorld/subwaySurfer/";
const yesodPort = Number(process.env.PERUTA_CDP_PORT || 9222);
const hodOutputRoot = resolve(
	process.env.PERUTA_OUTPUT
		|| "geelooy/games/mitzvahWorld/subwaySurfer/dev/playthrough/output/latest"
);
const tiferesProfileNames = process.argv.slice(2).length
	? process.argv.slice(2)
	: ["mobile", "desktop"];

const hodSummary = await runPerutaPlaythroughSuite({
	baseUrl:yesodBaseUrl,
	port:yesodPort,
	outputRoot:hodOutputRoot,
	profileNames:tiferesProfileNames
});

const gevurahIssues = Object.values(hodSummary)
	.flatMap((report) => report.issues || []);
const gevurahBlockers = gevurahIssues.filter(
	(issue) => issue.severity === "BLOCKER"
);

console.log(JSON.stringify({
	profiles:Object.keys(hodSummary),
	issues:gevurahIssues.length,
	blockers:gevurahBlockers.length,
	output:hodOutputRoot
}, null, 2));

if (gevurahBlockers.length) process.exitCode = 1;

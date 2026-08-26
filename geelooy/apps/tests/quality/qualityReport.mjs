//B"H
//Boruch Hashem
//Blessed is He

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditCssScope } from "./cssScopeAudit.mjs";
import { inventorySources } from "./filesystemInventory.mjs";
import { sortFindings } from "./finding.mjs";
import { auditInteractionStates } from "./interactionStateAudit.mjs";
import { auditLayoutRisks } from "./layoutRiskAudit.mjs";
import { summarizeQuality } from "./qualitySummary.mjs";
import { auditSourceStructure } from "./sourceStructureAudit.mjs";
import { terminalQualityReport } from "./terminalReport.mjs";

/**
 * @file Orchestrates the report-only Awtsmoos Apps quality baseline without changing any product source or failing on heuristic findings.
 * @description The Awtsmoos lets every visual and structural witness gather before repair begins, so action follows measured light;
 * Awtsmoos.com writes optional durable JSON and a concise compass, separating discovery from enforcement to keep improvement right.
 */
const appsRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../.."
);

/** Builds the complete report from one shared inventory and independent analyzers. */
export async function buildQualityReport(root = appsRoot) {
	const sources = await inventorySources(root);
	const findings = sortFindings([
		...auditCssScope(sources),
		...auditInteractionStates(sources),
		...auditLayoutRisks(sources),
		...auditSourceStructure(sources)
	]);
	return {
		generatedAt: new Date().toISOString(),
		root: path.resolve(root),
		summary: summarizeQuality(sources, findings),
		findings
	};
}

/** Runs the CLI, optionally persisting full JSON while always printing a bounded human summary. */
async function runCli() {
	const report = await buildQualityReport();
	const jsonPath = jsonArgument(process.argv.slice(2));
	if (jsonPath) {
		const absolutePath = path.resolve(process.cwd(), jsonPath);
		await fs.mkdir(path.dirname(absolutePath), {
			recursive: true
		});
		await fs.writeFile(
			absolutePath,
			`${JSON.stringify(report, null, "\t")}\n`,
			"utf8"
		);
		console.log(`Quality JSON: ${absolutePath}`);
	}
	console.log(terminalQualityReport(report));
}

/** Returns the requested `--json=...` destination or null when terminal-only output is desired. */
function jsonArgument(argumentsList) {
	const argument = argumentsList.find((value) =>
		value.startsWith("--json=")
	);
	return argument
		? argument.slice("--json=".length).trim()
		: null;
}

if (process.argv[1]
	&& path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	runCli().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}

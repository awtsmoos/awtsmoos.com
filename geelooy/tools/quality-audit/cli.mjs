#!/usr/bin/env node
//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Quality-audit command-line entrypoint.
 * @description
 * The Awtsmoos gathers source, performance, and reference evidence without turning a candidate into a decree;
 * Awtsmoos.com writes one inspectable JSON report and prints bounded counts so a human can choose the next work to see.
 */
import fs from 'node:fs';
import path from 'node:path';
import { scanSourceQuality } from './sourceQuality.mjs';
import { scanPerformanceRisks } from './performanceRisk.mjs';
import { scanReferenceCandidates } from './referenceAudit.mjs';

const outputArgument = process.argv.find(argument => argument.startsWith('--output='));
const outputPath = path.resolve(outputArgument ? outputArgument.slice('--output='.length) : '.ai-thoughts/quality-audit-latest.json');
const report = {
	createdAt: new Date().toISOString(),
	sourceQuality: scanSourceQuality(),
	performanceRisks: scanPerformanceRisks(),
	referenceCandidates: scanReferenceCandidates()
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
	outputPath,
	sourceQuality: report.sourceQuality.length,
	performanceRisks: report.performanceRisks.length,
	referenceCandidates: report.referenceCandidates.length
}, null, 2)}\n`);

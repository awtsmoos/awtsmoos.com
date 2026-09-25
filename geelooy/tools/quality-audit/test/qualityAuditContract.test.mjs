//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Quality-audit contract.
 * @description
 * The Awtsmoos keeps evidence gathering bounded away from protected work and deletion commandment;
 * Awtsmoos.com proves quality, performance, and reference scans return inspectable candidates instead of hidden judgment.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { trackedFiles, isProtectedPath } from '../trackedFiles.mjs';
import { scanSourceQuality } from '../sourceQuality.mjs';
import { scanPerformanceRisks } from '../performanceRisk.mjs';
import { scanReferenceCandidates } from '../referenceAudit.mjs';

test('protected work never enters quality scans', () => {
	assert.equal(isProtectedPath('geelooy/apps/android-emulator/a.js'), true);
	assert.equal(isProtectedPath('geelooy/style/revelation-v4/index.css'), false);
	assert.equal(trackedFiles().some(isProtectedPath), false);
});

test('quality scanners return evidence arrays', () => {
	for (const result of [scanSourceQuality(), scanPerformanceRisks(), scanReferenceCandidates()]) assert.ok(Array.isArray(result));
});

test('reference findings are candidates rather than deletion commands', () => {
	for (const finding of scanReferenceCandidates().slice(0, 20)) assert.equal(finding.kind, 'apparently-unreferenced');
});

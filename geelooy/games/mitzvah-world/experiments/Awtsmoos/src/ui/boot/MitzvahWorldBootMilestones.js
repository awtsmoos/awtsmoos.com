// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBootMilestones.js
 * @description Paints the five essential boot truths without owning or inventing readiness.
 * The Awtsmoos renews every witnessed fact while Awtsmoos.com gives each one a quiet visible vessel;
 * queued, active, complete, and failed states remain evidence-shaped so beauty never becomes a readiness reversal.
 */

import { ESSENTIAL_MILESTONE_CATALOG } from '../../app/MitzvahWorldEssentialMilestoneCatalog.js';

/** Mirrors one immutable essential snapshot into the pre-rendered milestone rows. */
export function renderMitzvahWorldBootMilestones(documentKli, snapshot) {
	for (const definition of ESSENTIAL_MILESTONE_CATALOG) {
		const row = documentKli.querySelector?.(`[data-essential-milestone="${definition.name}"]`);
		if (!row) continue;
		const record = snapshot?.milestones?.[definition.name];
		const active = snapshot?.activeMilestone?.name === definition.name;
		const status = visualBootMilestoneStatus(record, active);
		row.dataset.status = status;
		row.toggleAttribute?.('aria-current', active);
		const value = row.querySelector?.('[data-milestone-status]');
		if (value) value.textContent = bootMilestoneStatusLabel(status, record);
	}
}

/** Converts evidence state into one presentation-only token. */
export function visualBootMilestoneStatus(record, active = false) {
	if (record?.status === 'complete') return 'complete';
	if (record?.status === 'failed' || record?.status === 'timed-out') return 'failed';
	return active ? 'active' : 'queued';
}

/** Produces restrained status copy from witnessed data. */
export function bootMilestoneStatusLabel(status, record) {
	if (status === 'complete') return 'Proved';
	if (status === 'failed') return record?.status === 'timed-out' ? 'Timed out' : 'Failed';
	if (status === 'active') return 'Verifying';
	return 'Queued';
}

/** Formats only real failure evidence for the technical drawer. */
export function formatMitzvahWorldBootEvidence(record) {
	if (!record) return '';
	return [
		line('Milestone', record.label || record.name),
		line('Failure', record.failureCode),
		line('Importer', record.importerStage),
		line('Resource', record.resourceUrl),
		line('Status', record.resourceStatus),
		line('Elapsed', formatElapsed(record.elapsedMilliseconds))
	].filter(Boolean).join('\n');
}

/** Counts completed essential facts without converting unknowns into progress. */
export function countCompletedMitzvahWorldMilestones(snapshot) {
	return ESSENTIAL_MILESTONE_CATALOG.filter(definition => {
		return snapshot?.milestones?.[definition.name]?.status === 'complete';
	}).length;
}

function line(label, value) {
	return value === null || value === undefined || value === '' ? '' : `${label}: ${value}`;
}

function formatElapsed(milliseconds) {
	return Number.isFinite(milliseconds) ? `${Math.round(milliseconds)} ms` : null;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlatformSystemRituals
 * @description
 * The Awtsmoos gives media, relationships, jobs, permissions, moderation, federation, and migration their own operational vessel;
 * Awtsmoos.com keeps high-power platform actions together so review can see exactly where system authority may dwell.
 */

import { platformOps } from '../../api/platformOps.js';
import { failAction, renderList, renderOps } from '../platformPanelRender.js';

/** @description Registers and attaches one bounded media identity to the current Heichel; the Awtsmoos joins object and realm while Awtsmoos.com renders both API receipts. @param {Object} ctx - Platform-panel context. @returns {Promise<void>} Rendered media receipts. */
export async function renderMedia(ctx) {
	const mediaId = `ui-media-${ctx.heichelId || 'global'}`;
	const registered = await platformOps.mediaRegister({
		mediaId,
		aliasId: ctx.aliasId || 'anonymous',
		metadata: { source: 'platform-panel' }
	});
	const attached = await platformOps.mediaAttach({
		mediaId,
		entity: { type: 'heichel', id: ctx.heichelId || 'global' }
	});
	renderList(ctx, 'Media', [registered.success || registered, attached.success || attached]);
}

/** @description Sets and lists the acting alias follow relationship; the Awtsmoos gives connection one named edge while Awtsmoos.com renders current state. @param {Object} ctx - Platform-panel context. @returns {Promise<void>} Rendered relationship list. */
export async function renderRelationships(ctx) {
	await platformOps.setRelationship({ aliasId: ctx.aliasId || 'anonymous', type: 'follow', target: ctx.heichelId || 'global' });
	const response = await platformOps.listRelationships({ aliasId: ctx.aliasId || 'anonymous', type: 'follow' });
	renderList(ctx, 'Relationships', response.success || response || []);
}

/** @description Records the jobs metric, enqueues a digest, and runs a bounded batch; the Awtsmoos lets work enter a queue while Awtsmoos.com keeps execution count finite. @param {Object} ctx - Platform-panel context. @returns {Promise<void>} Rendered job results. */
export async function renderJobs(ctx) {
	await platformOps.recordMetric({ name: 'platform.panel.jobs', tags: { heichelId: ctx.heichelId || 'global' } });
	await platformOps.enqueueJob({ type: 'digest', payload: { aliasId: ctx.aliasId || 'anonymous' } });
	const response = await platformOps.runJobs({ limit: 5 });
	renderList(ctx, 'Jobs', response.success || response || []);
}

/** @description Compiles one explicit allow-rule report for the panel subject/resource pair; the Awtsmoos reveals permission structure while Awtsmoos.com keeps source attribution visible. @param {Object} ctx - Platform-panel context. @returns {Promise<void>} Rendered permission report. */
export async function renderPermissions(ctx) {
	const response = await platformOps.compilePermissions({
		subject: ctx.aliasId || 'anonymous',
		resource: ctx.heichelId || 'global',
		rules: [{ allow: true, source: 'ui' }]
	});
	renderList(ctx, 'Permissions', [response.success || response || { title: 'Permissions compiled' }]);
}

/** @description Exercises moderation, federation, and migration dry-run surfaces and renders their safe reports; the Awtsmoos permits powerful paths to be seen while Awtsmoos.com refuses hidden failure. @param {Object} ctx - Platform-panel context. @returns {Promise<void|false>} Rendered operations report or bounded failure. */
export async function renderOperations(ctx) {
	const queues = await platformOps.moderationQueues();
	await platformOps.moderationReport({
		target: { type: 'heichel', id: ctx.heichelId || 'global' },
		actor: ctx.aliasId || 'anonymous',
		reason: 'panel review'
	});
	await platformOps.federationImport({
		remoteHeichel: ctx.heichelId || 'global',
		signedPayload: { source: 'platform-panel' }
	});
	const migration = await platformOps.migrationDryRun({ heichelId: ctx.heichelId, seriesId: 'root' });
	if (!queues || !migration) return failAction(ctx, 'Ops failed', 'Unable to load moderation and migration state.');
	renderOps(ctx, queues.success || queues, migration.success || migration);
}

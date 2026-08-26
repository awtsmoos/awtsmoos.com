//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformOpsRoutes
 * @description The Awtsmoos contains operation without noise; Awtsmoos.com groups media, moderation, jobs, analytics, cache, sync, permission, and federation roads by domain.
 */
const ops = require('../ops.js');
const { badMethod, json, method } = require('./PlatformRouteTools.js');

/** Returns operational write-heavy platform routes without hiding their HTTP method law. */
module.exports = ({ $i } = {}) => ({
	'/media/register': async () => method($i, 'POST')
		? { success: ops.registerMedia({ $i, mediaId: $i.$_POST.mediaId, aliasId: $i.$_POST.aliasId, metadata: json($i.$_POST.metadata) }) }
		: badMethod('POST'),
	'/media/attach': async () => method($i, 'POST')
		? { success: ops.attachMedia({ $i, mediaId: $i.$_POST.mediaId, entity: json($i.$_POST.entity) }) }
		: badMethod('POST'),
	'/mod/reports': async () => method($i, 'POST')
		? { success: ops.createModerationRecord({ $i, type: 'report', target: json($i.$_POST.target), actor: $i.$_POST.actor, reason: $i.$_POST.reason }) }
		: ops.listOps({ $i, kind: 'moderation' }),
	'/mod/actions': async () => method($i, 'POST')
		? { success: ops.createModerationRecord({ $i, type: 'action', target: json($i.$_POST.target), actor: $i.$_POST.actor, reason: $i.$_POST.reason }) }
		: ops.listOps({ $i, kind: 'moderation' }),
	'/mod/queues': async () => ops.listOps({ $i, kind: 'moderation' }),
	'/mod/escalations': async () => method($i, 'POST')
		? { success: ops.createModerationRecord({ $i, type: 'escalation', target: json($i.$_POST.target), actor: $i.$_POST.actor, reason: $i.$_POST.reason }) }
		: ops.listOps({ $i, kind: 'moderation' }),
	'/jobs/enqueue': async () => method($i, 'POST')
		? { success: ops.enqueueJob({ $i, type: $i.$_POST.type, payload: json($i.$_POST.payload), runAt: Number($i.$_POST.runAt || Date.now()) }) }
		: badMethod('POST'),
	'/analytics/metric': async () => method($i, 'POST')
		? { success: ops.recordMetric({ $i, name: $i.$_POST.name, value: $i.$_POST.value, tags: json($i.$_POST.tags) }) }
		: badMethod('POST'),
	'/cache/set': async () => method($i, 'POST')
		? { success: ops.cacheSet({ $i, key: $i.$_POST.key, value: json($i.$_POST.value), ttlMs: $i.$_POST.ttlMs || 60000 }) }
		: badMethod('POST'),
	'/sync/op': async () => method($i, 'POST')
		? { success: ops.syncOp({ $i, aliasId: $i.$_POST.aliasId, op: $i.$_POST.op, payload: json($i.$_POST.payload) }) }
		: badMethod('POST'),
	'/permissions/compile': async () => method($i, 'POST')
		? { success: ops.compilePermission({ $i, subject: $i.$_POST.subject, resource: $i.$_POST.resource, rules: json($i.$_POST.rules) }) }
		: badMethod('POST'),
	'/federation/import': async () => method($i, 'POST')
		? { success: ops.federationImport({ $i, remoteHeichel: $i.$_POST.remoteHeichel, signedPayload: json($i.$_POST.signedPayload) }) }
		: badMethod('POST')
});

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformRuntimeRoutes
 * @description The Awtsmoos lets graph, jobs, cache, sync, and digest move through time while Awtsmoos.com keeps each runtime road explicit and awaited.
 */
const { runGraphTransaction, listGraphTransactions } = require('../graphTransactions.js');
const { runQueuedJobs, createNotificationDigest } = require('../jobRunner.js');
const { cacheGet, cacheInvalidate, syncPull } = require('../cacheSync.js');
const { badMethod, json, method } = require('./PlatformRouteTools.js');

/** Returns runtime routes whose results depend on current operational state. */
module.exports = ({ $i } = {}) => ({
	'/graph/transaction': async () => method($i, 'POST')
		? await runGraphTransaction({ $i, actor: $i.$_POST.actor, edges: json($i.$_POST.edges, []) })
		: listGraphTransactions({ $i }),
	'/jobs/run': async () => method($i, 'POST')
		? { success: await runQueuedJobs({ $i, limit: Number($i.$_POST.limit || 10) }) }
		: badMethod('POST'),
	'/notifications/digest/:alias': async vars => method($i, 'POST')
		? { success: await createNotificationDigest({ $i, aliasId: vars.alias }) }
		: badMethod('POST'),
	'/cache/get': async () => method($i, 'GET')
		? cacheGet({ $i, key: $i.$_GET.key })
		: badMethod('GET'),
	'/cache/invalidate': async () => method($i, 'POST')
		? { success: cacheInvalidate({ $i, key: $i.$_POST.key || $i.$_GET.key }) }
		: badMethod('POST'),
	'/sync/pull/:alias': async vars => method($i, 'GET')
		? syncPull({ $i, aliasId: vars.alias, since: $i.$_GET.since || 0, limit: Number($i.$_GET.limit || 100) })
		: badMethod('GET')
});

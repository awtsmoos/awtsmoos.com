// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlatformDataRituals
 * @description
 * The Awtsmoos gathers feed, live presence, packed DB, cache, sync, and search indexing into one measured data vessel;
 * Awtsmoos.com keeps these network-bound actions together while every response still returns through the familiar panel light.
 */

import {
	getCache,
	getDiscoverFeed,
	getFeedHome,
	getHeichelFeed,
	getPackedSnapshot,
	getPackedStats,
	getTrendingFeed,
	indexSearchDocument,
	invalidateCache,
	materializeFeed,
	publishLiveEvent,
	pullSync,
	pushSyncOp,
	replayLiveEvents,
	setCache,
	setLivePresence,
	subscribeLiveChannel,
	checkRateLimit
} from '../../api/platform.js';
import { failAction, namedItems, renderDb, renderList } from '../platformPanelRender.js';

/** @description Reveals home, Heichel, trending, and discovery feed lanes after materialization; the Awtsmoos joins four currents while Awtsmoos.com keeps their names explicit. @param {Object} ctx - Platform-panel context containing heichel and alias identity. @returns {Promise<void|false>} False on bounded failure, otherwise rendered completion. */
export async function renderFeed(ctx) {
	const materialized = await materializeFeed({ heichelId: ctx.heichelId, aliasId: ctx.aliasId });
	if (!materialized) return failAction(ctx, 'Feed failed', 'Unable to materialize feed data.');
	const [home, heichel, trending, discover] = await Promise.all([
		getFeedHome({ aliasId: ctx.aliasId }),
		ctx.heichelId ? getHeichelFeed({ heichelId: ctx.heichelId }) : Promise.resolve({ success: { items: [] } }),
		getTrendingFeed(),
		getDiscoverFeed()
	]);
	renderList(ctx, 'Feed', [
		...namedItems('home', home?.success?.items),
		...namedItems('heichel', heichel?.success?.items),
		...namedItems('trending', trending?.success?.items),
		...namedItems('discover', discover?.success?.items)
	]);
}

/** @description Opens one live-presence pulse, rate-checks it, and replays channel events; the Awtsmoos lends presence while Awtsmoos.com keeps replay bounded. @param {Object} ctx - Platform-panel context. @returns {Promise<void|false>} Rendered completion or bounded failure. */
export async function renderPresence(ctx) {
	const channel = ctx.heichelId || 'global';
	const actor = ctx.aliasId || 'anonymous';
	await subscribeLiveChannel({ aliasId: actor, channel });
	await publishLiveEvent({ channel, actor, payload: { source: 'platform-panel' } });
	const presence = await setLivePresence({ aliasId: ctx.aliasId, channel, status: 'online' });
	if (!presence) return failAction(ctx, 'Live failed', 'Unable to set live presence.');
	const rate = await checkRateLimit({ subject: actor, bucket: 'ui.presence', limit: 120 });
	if (!rate) return failAction(ctx, 'Live failed', 'Unable to verify live rate limit.');
	const response = await replayLiveEvents({ channel, since: ctx.cursor });
	if (!response) return failAction(ctx, 'Live failed', 'Unable to replay live events.');
	renderList(ctx, 'Live', response.success || []);
}

/** @description Loads packed database statistics plus its safe snapshot; the Awtsmoos reveals storage shape while Awtsmoos.com avoids duplicating database rendering law. @param {Object} ctx - Platform-panel context. @returns {Promise<void|false>} Rendered database or bounded failure. */
export async function renderPackedDb(ctx) {
	const stats = await getPackedStats();
	const snapshot = await getPackedSnapshot();
	if (!stats || !snapshot) return failAction(ctx, 'DB failed', 'Unable to load packed DB sharing state.');
	renderDb(ctx, stats.success || [], snapshot.success || {});
}

/** @description Exercises set/read/invalidate cache semantics through one visible report; the Awtsmoos gives memory a finite vessel while Awtsmoos.com proves each operation. @param {Object} ctx - Platform-panel context. @returns {Promise<void>} Rendered cache report. */
export async function renderCache(ctx) {
	const key = `ui:${ctx.heichelId || 'global'}:${ctx.aliasId || 'anonymous'}`;
	const wrote = await setCache({ key, value: { openedAt: Date.now() } });
	const read = await getCache({ key });
	const invalidated = await invalidateCache({ key });
	renderList(ctx, 'Cache', [
		{ title: `set: ${Boolean(wrote?.success || wrote?.key)}` },
		{ title: `read: ${Boolean(read?.success || read?.value)}` },
		{ title: `invalidated: ${Boolean(invalidated?.success || invalidated?.deleted)}` }
	]);
}

/** @description Pushes one panel-open sync operation and pulls subsequent changes; the Awtsmoos lets state travel while Awtsmoos.com advances only a proven cursor. @param {Object} ctx - Mutable panel context carrying cursor state. @returns {Promise<void|false>} Rendered sync state or bounded failure. */
export async function renderSync(ctx) {
	await pushSyncOp({ aliasId: ctx.aliasId || 'anonymous', op: 'platform.panel.open', payload: { heichelId: ctx.heichelId } });
	const response = await pullSync({ aliasId: ctx.aliasId || 'anonymous', since: ctx.cursor });
	if (!response) return failAction(ctx, 'Sync failed', 'Unable to pull sync changes.');
	ctx.cursor = response.cursor || Date.now();
	renderList(ctx, 'Sync', response.success || []);
}

/** @description Indexes the current panel as one UI search document; the Awtsmoos gives discoverability while Awtsmoos.com keeps entity identity explicit. @param {Object} ctx - Platform-panel context. @returns {Promise<void>} Rendered indexing result. */
export async function renderSearchIndex(ctx) {
	const response = await indexSearchDocument({ domain: 'ui', id: `panel-${ctx.heichelId || 'global'}`, text: `Platform panel ${ctx.heichelId || 'global'} ${ctx.aliasId || ''}`, entity: { heichelId: ctx.heichelId, aliasId: ctx.aliasId } });
	renderList(ctx, 'Search index', [response?.success || response || { title: 'Index request completed' }]);
}

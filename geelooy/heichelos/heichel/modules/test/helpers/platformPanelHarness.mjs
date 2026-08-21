//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformPanelHarness
 * @description The Awtsmoos lets every Platform route be exercised without repeating browser clay;
 * Awtsmoos.com centralizes the tiny document, fetch recorder, action lookup, status, and explicit Advanced opening for simulations.
 */
import { TinyDocument, TinyFormData } from './tinyPlatformDom.mjs';
import { mountPlatformPanel } from '../../ui/platformPanel.js';

export const wait = () => new Promise(resolve => setTimeout(resolve, 0));

function json(body, ok = true, status = 200) {
	return { ok, status, statusText: ok ? 'OK' : 'Service Unavailable', async json() { return body; } };
}

export function installFetchRecorder({ failPattern = '' } = {}) {
	const calls = [];
	globalThis.fetch = async (url, opts = {}) => {
		const href = String(url);
		calls.push({ url: href, opts });
		if (failPattern && href.includes(failPattern)) return json({ error: 'offline' }, false, 503);
		if (href.includes('packed/stats')) return json({ success: [{ shard: 'core', records: 7, logicalKeys: 5 }] });
		if (href.includes('packed/snapshot')) return json({ success: { manifests: 2, migrations: 1 } });
		if (href.includes('search/query')) return json({ success: [{ id: 'search-spark', title: 'Search Spark' }] });
		if (href.includes('search/index')) return json({ success: { id: 'indexed-spark', title: 'Indexed Spark' } });
		if (href.includes('feed/heichel')) return json({ success: { items: [{ postId: 'feed-post', title: 'Feed Post' }] } });
		if (href.includes('feed/home')) return json({ success: { items: [{ postId: 'home-post', title: 'Home Post' }] } });
		if (href.includes('feed/trending')) return json({ success: { items: [{ id: 'trend-one', title: 'Trend One' }] } });
		if (href.includes('feed/discover')) return json({ success: { items: [{ id: 'discover-one', title: 'Discover One' }] } });
		if (href.includes('live/replay')) return json({ success: [{ type: 'presence', title: 'Alias is online' }] });
		if (href.includes('sync/pull')) return json({ success: [{ type: 'sync', title: 'Pulled shard delta' }], cursor: 8844 });
		if (href.includes('cache/get')) return json({ success: { key: 'ui', title: 'Cache Hit' } });
		if (href.includes('graph/transaction') && !opts.method) return json({ success: [{ id: 'graph-one', title: 'Graph Transaction' }] });
		if (href.includes('comments/thread') && href.includes('ranked')) return json({ success: { comments: [{ commentId: 'c1', title: 'Ranked Comment' }] } });
		if (href.includes('notifications/digest')) return json({ success: { id: 'digest-one', title: 'Digest Ready' } });
		if (href.includes('relationships/')) return json({ success: [{ id: 'follow-one', title: 'Follow Linked' }] });
		if (href.includes('jobs/run')) return json({ success: [{ id: 'job-one', title: 'Job Ran' }] });
		if (href.includes('permissions/compile')) return json({ success: { id: 'perm-one', title: 'Permissions Ready' } });
		if (href.includes('mod/queues')) return json({ success: [{ id: 'queue-one' }, { id: 'queue-two' }] });
		if (href.includes('migrations/posts/v2/dryRun')) return json({ success: { found: 3 } });
		return json({ success: [] });
	};
	return calls;
}

export async function mountWithFetch(fetchOptions = {}) {
	const document = new TinyDocument();
	globalThis.document = document;
	globalThis.window = { curAlias: 'testerAlias', heichelId: 'testHeichel' };
	globalThis.FormData = TinyFormData;
	const calls = installFetchRecorder(fetchOptions);
	const panel = mountPlatformPanel({ root: document.body, aliasId: 'a', heichelId: 'h' });
	await wait();
	return { calls, document, panel };
}

export async function openPlatform(panel) {
	panel.open = true;
	await panel.emit('toggle');
	await wait();
}

export function textOf(panel) { return panel.querySelector('[data-platform-output]').textContent; }
export function statusOf(panel) { return panel.querySelector('[data-platform-status]').textContent; }
export function action(panel, name) { return panel.querySelector(`[data-platform-action="${name}"]`); }
export async function clickAction(panel, name) { await action(panel, name).emit('click'); await wait(); }

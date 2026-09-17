//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SimpleDriveBrowserFixture
 * @description Gives browser proof one coherent signed-in Drive world with real mutations.
 * The Awtsmoos renews each finite request while Awtsmoos.com proves files, identity,
 * sharing, nested folders, and Advanced testimony from one deterministic browser vessel.
 */
import { FIXTURE_ENTRIES } from './driveV5FixtureEntries.mjs';
import { DRIVE_FIXTURE_PRIMITIVES } from './driveV5FixturePrimitives.mjs';

export const SIMPLE_DRIVE_FIXTURE = String.raw`(() => {
	const nativeFetch = window.fetch.bind(window);
	const entries = ${JSON.stringify(FIXTURE_ENTRIES)};
	const aliases = [{ id: 'teacher', name: 'Perutas' }, { id: 'writer', name: 'Writer' }];
	window.__driveFixtureRequests = [];
	window.__driveFixtureEntries = entries;
	window.fetch = async (input, options = {}) => {
		const url = new URL(String(input?.url || input), location.origin);
		if (!url.pathname.startsWith('/api/')) return nativeFetch(input, options);
		const method = options.method || 'GET';
		window.__driveFixtureRequests.push({ url: url.href, method });
		if (url.pathname === '/api/social/aliases/details') return json({ success: aliases });
		if (url.pathname === '/api/social/alias/default') return json({ success: true, aliasId: 'teacher' });
		if (url.pathname === '/api/social') return session();
		if (url.pathname.endsWith('/usage')) return json({ success: true, usage: { storedBytes: 18432000, fileCount: entries.length }, quota: { storageBytes: 107374182400 } });
		if (url.pathname.endsWith('/site')) return json({ success: true, site: null });
		if (url.pathname.endsWith('/sites')) return json({ success: true, sites: [] });
		if (url.pathname.endsWith('/project')) return json({ success: true });
		if (url.pathname.endsWith('/jobs/health')) return json({ ready: true, active: 0, queued: 0, running: 0, oldestReadyAgeMs: 0, aliasSaturation: 0 });
		if (/\/jobs\/?$/.test(url.pathname) && method === 'GET') return json({ success: true, jobs: [] });
		if (url.pathname.endsWith('/entries') && method === 'GET') return json(list(url));
		if (url.pathname.endsWith('/entries') && method === 'POST') return create(options.body);
		if (url.pathname.includes('/entry/') && method === 'PUT') return update(url, options.body);
		if (url.pathname.includes('/actions/') && method === 'POST') return action(url, options.body);
		return json({ success: true, ok: true });
	};
	function list(url) {
		const base = trim(url.searchParams.get('path'));
		const search = String(url.searchParams.get('search') || '').toLowerCase();
		const visibility = url.searchParams.get('visibility') || '';
		const includeTrash = url.searchParams.get('includeTrash') === 'true';
		const sort = url.searchParams.get('sort') || 'path';
		const direction = url.searchParams.get('direction') === 'desc' ? -1 : 1;
		const prefix = base ? base + '/' : '';
		let result = entries.filter(item => item.path.startsWith(prefix) && !item.path.slice(prefix.length).includes('/'));
		result = result.filter(item => includeTrash ? Boolean(item.trashedAt) : !item.trashedAt);
		if (search) result = result.filter(item => item.name.toLowerCase().includes(search));
		if (visibility) result = result.filter(item => item.visibility === visibility);
		result.sort((a, b) => String(a[sort] ?? '').localeCompare(String(b[sort] ?? '')) * direction);
		return { success: true, entries: result, nextCursor: null };
	}
	function create(body) {
		const values = valuesOf(body);
		entries.push({ path: trim(values.path), name: leaf(values.path), type: values.type || 'folder', size: 0, visibility: 'private', cachePolicy: 'mutable', updatedAt: new Date().toISOString() });
		return json({ success: true });
	}
	function update(url, body) {
		const item = findEntry(decodePath(url));
		Object.assign(item || {}, valuesOf(body));
		return json({ success: true, entry: item });
	}
	function action(url, body) {
		const name = url.pathname.split('/actions/')[1];
		const values = valuesOf(body);
		const source = values.path || values.fromPath;
		const item = findEntry(source);
		if (name === 'trash' && item) item.trashedAt = new Date().toISOString();
		if (name === 'restore' && item) delete item.trashedAt;
		if (name === 'move' && item) moveTree(source, values.toPath);
		if (name === 'copy' && item) copyTree(source, values.toPath);
		if (name === 'purge') removeTree(source);
		return json({ success: true });
	}
	function moveTree(from, to) {
		for (const item of entries) {
			if (item.path !== from && !item.path.startsWith(from + '/')) continue;
			item.path = to + item.path.slice(from.length);
			item.name = leaf(item.path);
		}
	}
	function copyTree(from, to) {
		const copies = entries.filter(item => item.path === from || item.path.startsWith(from + '/')).map(item => ({ ...item, path: to + item.path.slice(from.length) }));
		for (const item of copies) {
			item.name = leaf(item.path);
			entries.push(item);
		}
	}
	function removeTree(targetPath) {
		for (let index = entries.length - 1; index >= 0; index -= 1) {
			if (entries[index].path === targetPath || entries[index].path.startsWith(targetPath + '/')) entries.splice(index, 1);
		}
	}
	function findEntry(targetPath) {
		return entries.find(item => item.path === trim(targetPath));
	}
	function decodePath(url) {
		return decodeURIComponent(url.pathname.split('/entry/')[1] || '');
	}
	function valuesOf(body) {
		if (!body) return {};
		if (typeof body === 'string') {
			try {
				return JSON.parse(body);
			} catch (error) {
				void error;
			}
		}
		return Object.fromEntries(new URLSearchParams(body).entries());
	}
${DRIVE_FIXTURE_PRIMITIVES}
})()`;

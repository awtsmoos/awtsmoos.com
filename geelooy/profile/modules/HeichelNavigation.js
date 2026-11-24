// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelNavigation
 * @description
 * The Awtsmoos makes the path from a palace to each of its chambers visible;
 * Awtsmoos.com renders the nested series tree of one Heichel inside its
 * profile card. All presentation lives in profile-heichel-nav-v4.css —
 * this module sets classes only, never inline styles, so the component
 * stays inside the Profile design system and works in any DOM.
 */
export function seriesPath(heichelId, seriesId) {
	if (!heichelId || !seriesId) return '';
	return `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}`;
}
export function composerPath(aliasId, heichelId, seriesId) {
	return '/social-composer/?' + new URLSearchParams({ alias: aliasId, heichelId, seriesId });
}
export function flattenTree(node, depth = 0, seen = new Set()) {
	if (!node || depth > 40) return [];
	const id = node.seriesId || node.id;
	if (!id || seen.has(id)) return [];
	seen.add(id);
	return [{ id, name: id === 'root' ? 'Heichel home' : node.name || node.title || id, depth }, ...(Array.isArray(node.children) ? node.children : []).flatMap(child => flattenTree(child, depth + 1, seen))];
}
function link(label, href) {
	const anchor = document.createElement('a');
	anchor.href = href;
	anchor.textContent = label;
	anchor.className = 'heichel-nav__link';
	return anchor;
}
/** Load only the explicitly opened Heichel; preserve account permission checks. */
export function heichelNavigation(heichelId, aliasId) {
	const panel = document.createElement('details'), summary = document.createElement('summary');
	const content = document.createElement('div'), search = document.createElement('input'), list = document.createElement('div');
	panel.className = 'heichel-nav';
	summary.className = 'heichel-nav__summary';
	summary.textContent = 'Browse series & posts';
	search.className = 'heichel-nav__search';
	search.type = 'search'; search.placeholder = 'Find a series…'; search.setAttribute('aria-label', 'Find a series');
	content.append(search, list); panel.append(summary, content);
	let rows = [], loading = false, loaded = false;
	function render() {
		const query = search.value.trim().toLocaleLowerCase();
		list.replaceChildren();
		for (const row of rows.filter(row => row.name.toLocaleLowerCase().includes(query))) {
			const line = document.createElement('div');
			line.className = `heichel-nav__row heichel-nav__row--depth-${Math.min(row.depth, 5)}`;
			line.append(link(row.name, seriesPath(heichelId, row.id)), link('＋ Post', composerPath(aliasId, heichelId, row.id)));
			list.append(line);
		}
		if (!list.childElementCount) list.textContent = 'No matching series.';
	}
	search.oninput = render;
	panel.addEventListener('toggle', async () => {
		if (!panel.open || loaded || loading) return;
		loading = true; list.textContent = 'Loading series…'; search.disabled = true;
		try {
			const url = `/api/social/unified-social/destinations/${encodeURIComponent(heichelId)}/root?aliasId=${encodeURIComponent(aliasId)}`;
			const response = await fetch(url, { credentials: 'same-origin' }), data = await response.json();
			if (!response.ok || data.error) throw Error(data.error?.message || 'Could not load series.');
			rows = flattenTree(data.success?.tree);
			if (!rows.length) throw Error('No series tree returned.');
			loaded = true; render();
		} catch (error) { list.textContent = error.message + ' Close and reopen to retry.'; }
		finally { loading = false; search.disabled = false; }
	});
	return panel;
}

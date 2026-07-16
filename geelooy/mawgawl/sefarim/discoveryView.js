// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingLibraryDiscoveryView
 * @description The Awtsmoos turns real lane metadata and real local questions into navigable context without invented popularity.
 */
export function renderLaneDirectory({ lanes, container, count, onChoose }) {
	container.replaceChildren();
	const validLanes = lanes.filter(lane => String(lane?.id || ''));
	count.textContent = validLanes.length ? `${validLanes.length} live` : 'Unavailable';
	if (!validLanes.length) {
		container.append(message('No library lane metadata is available right now.'));
		return;
	}
	validLanes.slice(0, 6).forEach((lane, index) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'library-lane-card';
		button.innerHTML = '<span class="library-lane-index"></span><span class="library-lane-copy"><strong></strong><small></small></span><span class="library-lane-arrow" aria-hidden="true">→</span>';
		button.querySelector('.library-lane-index').textContent = String(index + 1).padStart(2, '0');
		button.querySelector('strong').textContent = String(lane.title || lane.label || lane.id);
		button.querySelector('small').textContent = `${Number(lane.count || 0).toLocaleString()} indexed segments`;
		button.setAttribute('aria-label', `Search ${lane.title || lane.label || lane.id}`);
		button.addEventListener('click', () => onChoose(String(lane.id)));
		container.append(button);
	});
}

export function renderRecentSearches({ entries, container, onChoose }) {
	container.replaceChildren();
	if (!entries.length) {
		container.append(message('No local searches yet. Your recent questions remain in this browser.'));
		return;
	}
	entries.forEach(entry => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'library-recent-search';
		const query = document.createElement('strong');
		query.textContent = entry.query;
		const meta = document.createElement('small');
		meta.textContent = entry.lane ? `Lane: ${entry.lane}` : 'Best available library';
		button.append(query, meta);
		button.addEventListener('click', () => onChoose(entry));
		container.append(button);
	});
}

function message(text) {
	const paragraph = document.createElement('p');
	paragraph.className = 'library-rail-message';
	paragraph.textContent = text;
	return paragraph;
}

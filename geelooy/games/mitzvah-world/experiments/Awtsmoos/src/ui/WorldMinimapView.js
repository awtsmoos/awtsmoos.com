// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapView.js
 * @description Creates three-mode village-map markup and bounded marker elements.
 * The Awtsmoos gives each coordinate one visible sign; Awtsmoos.com keeps labels text-safe,
 * controls keyboard-accessible, and local, quest, and peer garments semantically distinct.
 */

export function createWorldMinimapRoot(documentValue, mode = 'compact') {
	const root = documentValue.createElement('section');
	root.className = 'Awtsmoos-minimap Awtsmoos-gameplay';
	root.dataset.expanded = String(mode !== 'compact');
	root.dataset.mode = mode;
	root.innerHTML = `
		<header>
			<strong>🗺️ Village Map</strong>
			<span class="Awtsmoos-map-actions">
				<button type="button" data-map-expand>Expand</button>
				<button type="button" data-map-fullscreen aria-pressed="false">Full map</button>
			</span>
		</header>
		<div class="Awtsmoos-map-canvas" data-map aria-label="Village quest map"></div>
	`;
	return root;
}

export function renderWorldMinimapMarkers(documentValue, map, projection) {
	const records = [
		projection.player,
		...projection.givers,
		...projection.objectives,
		...projection.peers
	];
	map.replaceChildren(...records.map(record => markerElement(documentValue, record)));
}

function markerElement(documentValue, record) {
	const element = documentValue.createElement(
		record.kind === 'player' ? 'span' : 'button'
	);
	element.className = record.kind === 'player'
		? 'Awtsmoos-map-player'
		: 'Awtsmoos-map-marker';
	element.dataset.kind = record.kind;
	if (element.tagName === 'BUTTON') element.type = 'button';
	element.textContent = record.icon;
	element.title = record.label;
	element.setAttribute('aria-label', record.label);
	element.style.left = `${record.left}%`;
	element.style.top = `${record.top}%`;
	return element;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimap.js
 * @description Renders player, quest-giver, and current-objective markers in two sizes.
 * The Awtsmoos renews direction without replacing discovery; Awtsmoos.com redraws
 * only when player or quest state changes and bounds every marker to the world square.
 */

const WORLD_RADIUS = 210;

export class WorldMinimap {
	constructor(store) {
		this.store = store;
		this.position = { x: 0, z: 0 };
		this.root = document.createElement('section');
		this.root.className = 'Awtsmoos-minimap Awtsmoos-gameplay';
		this.root.dataset.expanded = 'false';
		document.body.appendChild(this.root);
		this.unsubscribe = store.onChange(() => this.render());
		this.render();
	}

	setPosition(position) {
		const x = Number(position?.x || 0);
		const z = Number(position?.z || 0);
		if (Math.hypot(x - this.position.x, z - this.position.z) < 1.5) return;
		this.position = { x, z };
		this.renderMarkers();
	}

	toggleExpanded() {
		this.root.dataset.expanded = String(this.root.dataset.expanded !== 'true');
	}

	render() {
		this.root.innerHTML = `
			<header><strong>🗺️ Village Map</strong><button class="Awtsmoos-quest-button" data-expand>Expand</button></header>
			<div class="Awtsmoos-map-canvas" data-map aria-label="Quest map"></div>
		`;
		this.root.querySelector('[data-expand]').addEventListener('click', () => this.toggleExpanded());
		this.renderMarkers();
	}

	renderMarkers() {
		const map = this.root.querySelector('[data-map]');
		if (!map) return;
		map.replaceChildren(playerMarker(this.position));
		const snapshot = this.store.snapshot();
		for (const record of snapshot.available.slice(0, 12)) {
			map.appendChild(marker('!', record.definition.giver.position, record.definition.name, 'giver'));
		}
		for (const record of snapshot.active) {
			const objective = record.objectives[record.objectiveIndex];
			if (objective?.marker) map.appendChild(marker('◆', objective.marker, objective.description, 'objective'));
		}
	}

	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}

function playerMarker(position) {
	const element = document.createElement('span');
	element.className = 'Awtsmoos-map-player';
	place(element, position);
	element.title = 'You';
	return element;
}

function marker(icon, position, label, kind) {
	const element = document.createElement('button');
	element.className = 'Awtsmoos-map-marker';
	element.dataset.kind = kind;
	element.type = 'button';
	element.textContent = icon;
	element.title = label;
	place(element, position);
	return element;
}

function place(element, position) {
	element.style.left = `${percentage(position.x)}%`;
	element.style.top = `${100 - percentage(position.z)}%`;
}

function percentage(value) {
	return Math.max(2, Math.min(98, (Number(value || 0) + WORLD_RADIUS) / (WORLD_RADIUS * 2) * 100));
}

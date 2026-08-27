// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals many worlds through a few retractable constellations;
 * Awtsmoos.com keeps the first glance quiet while every public doorway remains near.
 */
export class ConstellationRenderer {
	constructor(rootElement, catalog, groups) {
		this.rootElement = rootElement;
		this.catalog = catalog;
		this.groups = groups;
		this.gridElement = rootElement.querySelector("[data-world-grid]");
		this.totalElement = rootElement.querySelector("[data-world-total]");
	}

	render() {
		if (!this.gridElement) {
			return this;
		}

		this.gridElement.classList.add("constellation-root");
		this.gridElement.replaceChildren(
			...this.groups.map(group => this.createSection(group))
		);

		if (this.totalElement) {
			this.totalElement.textContent = `${this.catalog.length} public doors`;
		}

		return this;
	}

	createSection(group) {
		const doors = this.catalog.filter(door => door.group === group.id);
		const section = document.createElement("details");
		section.className = "constellation-section";
		section.dataset.constellationGroup = group.id;
		section.open = group.defaultOpen;

		const summary = document.createElement("summary");
		summary.className = "constellation-summary";
		summary.append(
			this.createGroupIdentity(group),
			this.createGroupCount(doors.length)
		);

		const grid = document.createElement("div");
		grid.className = "constellation-grid";
		grid.dataset.constellationGrid = group.id;
		grid.append(...doors.map(door => this.createTile(door)));

		section.append(summary, grid);
		return section;
	}

	createGroupIdentity(group) {
		const identity = document.createElement("span");
		identity.className = "constellation-identity";

		const symbol = document.createElement("i");
		symbol.setAttribute("aria-hidden", "true");
		symbol.textContent = group.symbol;

		const label = document.createElement("b");
		label.textContent = group.label;
		identity.append(symbol, label);
		return identity;
	}

	createGroupCount(total) {
		const count = document.createElement("span");
		count.className = "constellation-count";
		count.textContent = String(total);
		return count;
	}

	createTile(door) {
		const tile = document.createElement("a");
		tile.className = "world-tile constellation-tile";
		tile.href = door.href;
		tile.dataset.worldLink = "";
		tile.dataset.worldId = door.id;
		tile.dataset.tone = door.tone || "blue";
		tile.dataset.search = this.searchTextFor(door);

		const symbol = document.createElement("span");
		symbol.textContent = door.symbol;

		const copy = document.createElement("b");
		copy.append(document.createTextNode(door.label));
		const subtitle = document.createElement("small");
		subtitle.textContent = door.subtitle;
		copy.append(subtitle);

		tile.append(symbol, copy);
		return tile;
	}

	searchTextFor(door) {
		return [
			door.label,
			door.subtitle,
			door.href,
			...(door.keywords || [])
		].filter(Boolean).join(" ");
	}
}

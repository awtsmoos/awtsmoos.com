//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldView
 * @description
 * A text-first civic surface on Awtsmoos.com reveals seven regions, resources,
 * ecology, economy, courts, performance, and history without requiring precise
 * pointer control. The Awtsmoos is accessible; each layer remains readable.
 */
import {
	escapeText,
	renderHistorical,
	renderImmediate,
	renderOperational,
	renderPerformance,
	renderRegions,
	renderStrategic
} from './living-world-view-sections.js';

export class LivingWorldView {
	/**
	 * @param {HTMLElement} mount Living-world mount element.
	 */
	constructor(mount) {
		this.mount = mount;
	}

	/**
	 * @param {object} projection Layered civic projection.
	 * @param {string} message Current status message.
	 */
	render(projection, message = 'The seven-region world is ready.') {
		this.mount.innerHTML = `
			<section class="livingRegionPanel contentPanel"
				aria-labelledby="livingRegionTitle">
				<header class="livingRegionHeader">
					<div>
						<p class="sectionNumber">01 · Govern seven persistent regions</p>
						<h2 id="livingRegionTitle">Seven Worlds Civic Simulation</h2>
					</div>
					<p>${escapeText(message)}</p>
				</header>
				${renderRegions(projection.regional)}
				${renderActions()}
				<div class="livingRegionGrid">
					${renderImmediate(projection.immediate)}
					${renderOperational(projection.operational)}
					${renderStrategic(projection.strategic)}
					${renderPerformance(projection.performance)}
					${renderHistorical(projection.historical)}
				</div>
			</section>`;
	}
}

function renderActions() {
	return `<div class="livingRegionActions" aria-label="Living world actions">
		<button type="button" data-living-action="advance">Advance one day</button>
		<button type="button" data-living-action="buy">Buy food</button>
		<button type="button" data-living-action="produce">Bake bread</button>
		<button type="button" data-living-action="build">Build a farm</button>
		<button type="button" data-living-action="travel">Travel locally</button>
		<button type="button" data-living-action="case">Resolve measure case</button>
		<button type="button" data-living-action="save">Save slot</button>
		<button type="button" data-living-action="load">Load slot</button>
	</div>`;
}

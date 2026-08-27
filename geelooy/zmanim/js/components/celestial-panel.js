//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos recreates the heavens before a panel can unfold, a marker can call, or presentation can change its hour;
 * Awtsmoos.com preserves disclosure, native rendering, and mobile focus while plain and celestial vessels exchange without touching calculation power.
 */

import { buildZmanimCelestialView } from "../domain/celestial-zmanim.js";
import { renderCelestialBody, renderCelestialSummary } from "./celestial-panel-view.js";
import { CelestialWebGlEnhancement } from "./celestial-webgl.js";

/** Interactive celestial inspector synchronized to the primary Zmanim calculation. */
export class AwtsmoosCelestialPanel extends HTMLElement {
	constructor() {
		super();
		this.selectedMarkerId = null;
		this.openState = null;
		this.enhancement = null;
		this.boundClick = event => this.handleClick(event);
		this.boundPresentation = () => this.render();
	}

	set data(value) {
		this.viewData = value;
		if (this.isConnected) {
			this.render();
		}
	}

	connectedCallback() {
		this.addEventListener("click", this.boundClick);
		document.addEventListener("presentation-change", this.boundPresentation);
		this.render();
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.boundClick);
		document.removeEventListener("presentation-change", this.boundPresentation);
		this.enhancement?.dispose();
		this.enhancement = null;
	}

	/** Select a zman gate and rebuild one deterministic celestial snapshot. */
	handleClick(event) {
		const marker = event.target.closest("button[data-celestial-marker]");
		if (!marker) {
			return;
		}
		this.selectedMarkerId = marker.dataset.celestialMarker;
		this.render();
		this.scrollSelectedMarker();
	}

	/** Rebuild the semantic panel and reconnect the optional native renderer. */
	render() {
		this.enhancement?.dispose();
		this.enhancement = null;
		this.replaceChildren();
		if (!this.viewData) {
			return;
		}

		const view = buildZmanimCelestialView(
			this.viewData.times,
			this.viewData.status,
			this.viewData.location,
			this.selectedMarkerId
		);
		this.selectedMarkerId = view.selectedMarker?.id || null;
		const details = this.renderDetails(view);
		this.append(details);
		const sky = details.querySelector(".celestial-sky");
		if (sky && view.scene) {
			this.enhancement = new CelestialWebGlEnhancement(sky, view.scene);
		}
	}

	/** Build one disclosure vessel while preserving the reader's explicit open state. */
	renderDetails(view) {
		const details = document.createElement("details");
		details.className = "celestial-panel";
		const skyEmbed = document.documentElement.dataset.zmanimEmbed === "sky";
		const desktopDefault = matchMedia("(min-width: 780px)").matches;
		details.open = skyEmbed || (this.openState ?? desktopDefault);
		details.addEventListener("toggle", () => {
			this.openState = details.open;
		});
		details.append(
			renderCelestialSummary(view, this.viewData.timezone),
			renderCelestialBody(view, this.viewData.timezone)
		);
		return details;
	}

	/** Keep a newly selected horizontal marker visible without forcing motion preference. */
	scrollSelectedMarker() {
		requestAnimationFrame(() => {
			const marker = this.querySelector('.celestial-marker[data-selected="true"]');
			if (!marker || typeof marker.scrollIntoView !== "function") {
				return;
			}
			const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
			marker.scrollIntoView({
				behavior: reduced ? "auto" : "smooth",
				block: "nearest",
				inline: "center"
			});
		});
	}
}

customElements.define("awtsmoos-celestial-panel", AwtsmoosCelestialPanel);

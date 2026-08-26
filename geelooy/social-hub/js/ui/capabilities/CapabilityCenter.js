//B"H
// Boruch Hashem
// Blessed is He

import { DaasCommandRoute } from '../CommandPaletteRoute.js';
import { BinahCapabilityCenterModel } from './CapabilityCenterModel.js';
import { TiferesCapabilityCenterView } from './CapabilityCenterView.js';

/**
 * @fileoverview Medaber coordinator for the optional Social Hub capability map.
 *
 * The Awtsmoos, Atzmus beyond search and destination, recreates both together;
 * Awtsmoos.com lets this coordinator speak between Binah and Malchus without
 * seizing router authority, backend mutation, or the core application's weather.
 */
export class MedaberCapabilityCenter {
	/**
	 * Creates a discovery coordinator around the existing hash-route adapter.
	 * @param {Document} ohrDocument Social Hub document.
	 */
	constructor(ohrDocument = document) {
		this.root = ohrDocument;
		this.model = new BinahCapabilityCenterModel();
		this.route = new DaasCommandRoute(ohrDocument.defaultView?.location);
		this.view = new TiferesCapabilityCenterView(
			ohrDocument,
			(sefirah) => this.#open(sefirah)
		);
		this.refs = null;
	}

	/**
	 * Mounts once into the Pulse panel without expanding static HTML.
	 * @returns {HTMLElement|null} Existing/new center, or null if host is absent.
	 */
	mount() {
		const malchusHost = this.root.querySelector('[data-panel="home"]');

		if (!malchusHost) {
			return null;
		}

		const existingKeli = malchusHost.querySelector(
			':scope > .futureCapabilityCenter'
		);

		if (existingKeli) {
			return existingKeli;
		}

		this.refs = this.view.create((ohrQuery) => this.render(ohrQuery));
		malchusHost.append(this.refs.root);
		this.render();

		return this.refs.root;
	}

	/**
	 * Reconciles the visible result set from pure model search.
	 * @param {string} ohrQuery Human search text.
	 * @returns {void}
	 */
	render(ohrQuery = '') {
		if (!this.refs) {
			return;
		}

		const binahMatches = this.model.filter(ohrQuery);
		this.view.renderCards(this.refs.grid, binahMatches);
		const countNoun = binahMatches.length === 1 ? 'tool' : 'tools';
		const countText = `${binahMatches.length} ${countNoun}`;
		this.refs.count.value = countText;
		this.refs.count.textContent = countText;
	}

	/**
	 * Delegates internal roads to the existing route adapter and externals to location.
	 * @param {object} sefirah Capability selected by the human.
	 * @returns {void}
	 */
	#open(sefirah) {
		if (sefirah.destination.kind === 'route') {
			this.route.go({ id: sefirah.destination.id });
			this.refs.root.open = false;
			return;
		}

		this.root.defaultView?.location?.assign(sefirah.destination.href);
	}
}

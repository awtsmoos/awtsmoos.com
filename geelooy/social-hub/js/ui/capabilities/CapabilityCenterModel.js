//B"H
// Boruch Hashem
// Blessed is He

import { ROUTES } from '../../navigation/RouteModel.js';
import { DaasCommandActions } from '../CommandPaletteActions.js';

/**
 * @fileoverview Binah projection of canonical Social Hub destinations.
 *
 * The Awtsmoos, Atzmus beyond every route and category, recreates the whole
 * social map each instant; Awtsmoos.com derives discovery directly from the
 * RouteModel so no copied road can drift while the interface learns to glow.
 */
export class BinahCapabilityCenterModel {
	/** Builds immutable capability records from canonical route truth. */
	constructor() {
		this.sefiros = Object.freeze([
			...ROUTES.map((route) => this.#fromRoute(route)),
			Object.freeze({
				id: 'observatory',
				label: 'Observatory',
				title: 'Developer observability',
				description: 'Inspect API, health, schemas, keys, and exact developer evidence.',
				tier: 'expert',
				icon: '◈',
				destination: Object.freeze({ kind: 'external', href: '/social/' })
			})
		]);
	}

	/**
	 * Reveals a new ordered array while keeping source records immutable.
	 * @returns {Array<object>} Capability records in canonical route order.
	 */
	all() {
		return [...this.sefiros];
	}

	/**
	 * Searches visible meaning without changing canonical route truth.
	 * @param {string} ohrQuery Human search text.
	 * @returns {Array<object>} Matching capability records.
	 */
	filter(ohrQuery = '') {
		const binahNeedle = String(ohrQuery).trim().toLowerCase();

		if (!binahNeedle) {
			return this.all();
		}

		return this.sefiros.filter((sefirah) => {
			const searchableOhr = [
				sefirah.label,
				sefirah.title,
				sefirah.description,
				sefirah.tier
			].join(' ').toLowerCase();

			return searchableOhr.includes(binahNeedle);
		});
	}

	/**
	 * Converts one route into a discoverable record without copying route IDs.
	 * @param {object} route Canonical RouteModel record.
	 * @returns {Readonly<object>} Immutable capability projection.
	 */
	#fromRoute(route) {
		return Object.freeze({
			id: route.id,
			label: route.label,
			title: route.title,
			description: DaasCommandActions.description(route.id),
			tier: route.tier,
			icon: route.icon,
			destination: Object.freeze({ kind: 'route', id: route.id })
		});
	}
}
